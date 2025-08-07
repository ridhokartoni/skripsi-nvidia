const express = require('express');
const { isAuthenticated } = require('../../middleware/middleware');
const { exec } = require('child_process');

const { findUserById, getAvailablePort, createContainer, getContainerByName, getContainersByUserId, deleteContainer, getAllContainer, updatePassword } = require('./docker.services');

const router = express.Router();

router.post('/createContainer', isAuthenticated, async (req, res, next) => {
    try {
        const { imageName, memoryLimit, cpus, gpus } = req.body;
        //check all the required field
        if (!imageName || !memoryLimit || !cpus || !gpus) {
            res.status(400).json({
                data: {
                },
                meta:{
                    code: 400,
                    message: 'Bad Request: Missing required fields',
                }
            });
            return;
        }
        //how to get userId from auth and make it different userId in body
        
        const adminId = req.userId;
        const admin = await findUserById(adminId);
        console.log('User:', admin);
        //check if user exist
        if (!admin) {
            res.status(404).json({
                data: {
                },
                meta:{
                    code: 404,
                    message: 'User not found',
                }
            });
            return;
        }
        //check if user is admin
        if (!admin.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to create container',
                }
            });
            return;
        }
        
        const { userContainer } = req.body;
        const user = await findUserById(parseInt(userContainer));
        //check if user is exist
        if (!user) {
            res.status(404).json({
                data: {
                },
                meta:{
                    code: 404,
                    message: 'User not found',
                }
            });
            return;
        }
        console.log('User:', user);

        const containerName = user.fullName.replace(' ', '') + Date.now();
        console.log('Container name:', containerName);
        const portSSH = await getAvailablePort(20000, 21000);
        const portJupyter = await getAvailablePort(20000, 21000);

        const username ="root";
        let password = '';
        for(let i = 0; i < 8; i++){
            password += Math.random().toString(36).charAt(2);
        }
        console.log(password);

        //passing the variable username and password to the docker env so it can be used for root login
        
        // Build GPU flag based on the value
        let gpuFlag = '';
        if (gpus && gpus.toLowerCase() !== 'none') {
            gpuFlag = `--gpus "${gpus}"`;
        }
        
        const command = `docker run -d --dns 172.17.9.25 --label user=${userContainer} -e USERNAME=${username} -e PASSWORD=${password} -e PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin -e WorkingDir=/root -e NB_USER=root -e HOME=/root --user root --name ${containerName} --memory=${memoryLimit} --cpus=${cpus} ${gpuFlag} -p ${portSSH}:22 -p ${portJupyter}:8888 ${imageName} /bin/bash -c "apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo \\$USERNAME:\\$PASSWORD | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && echo 'export PATH=\\$PATH:/opt/conda/bin' >> /etc/profile && /usr/sbin/sshd -D & jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root"`;
        // const command = `docker run -d --label user=${user.userContainer} -e USERNAME=${username} -e PASSWORD=${password} -e PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin -e WorkingDir=/root -e NB_USER=root -e HOME=/root --user root --name ${containerName} --memory=${memoryLimit} --cpus=${cpus} -p ${portSSH}:22 -p ${portJupyter}:8888 ${imageName} /bin/bash -c "apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo \\$USERNAME:\\$PASSWORD | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && echo 'export PATH=\\$PATH:/opt/conda/bin' >> /etc/profile && /usr/sbin/sshd -D & jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root"`;

        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    reject(error);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    // Check if the stderr message is the specific warning about swap limit capabilities
	            if (!stderr.includes('Your kernel does not support swap limit capabilities')) {
	                reject(new Error(stderr));
	            }
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        });
    
        await execPromise;
        // Add container data to the database
        const containerData = await createContainer({
            name: containerName,
            imageName: imageName,
            sshPort: portSSH,
            jupyterPort: portJupyter,
            password: password,
            CPU: parseInt(cpus),
            RAM: memoryLimit,
            GPU: gpus,
            userId: parseInt(userContainer),
        });
        console.log('Container data added to the database successfully');

        res.status(201).json({
            data: {
                containerData
            },
            meta:{
                code: 201,
                message: 'Container created and started successfully',
            }
        });
        } catch (err) {
            next (err);
        }
});

router.post('/container/:containerName/reset', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId
        //if not return error
        const container = await getContainerByName(containerName);
        //check all the required field
        if (!containerName) {
            res.status(400).json({
                data: {
                },
                meta:{
                    code: 400,
                    message: 'Bad Request: Missing required fields',
                }
            });
            return;
        }
        if (!container) {
            res.status(404).json({
                data: {
                },
                meta:{
                    code: 404,
                    message: 'Container not found',
                }
            });
            return;
        }

        //check if user is same with container user
        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to reset this container',
                }
            });
            return;
        }
        
        const portSSH = container.sshPort;
        const portJupyter = container.jupyterPort;
        const username = "root";
        const password = container.password;
        const memoryLimit = container.RAM;
        const cpus = container.CPU;
        const gpus = container.GPU;
        const imageName = container.imageName;
        const userContainer = container.userId;

        // Build GPU flag based on the value
        let gpuFlag = '';
        if (gpus && gpus.toLowerCase() !== 'none') {
            gpuFlag = `--gpus "${gpus}"`;
        }

        //remove the container and create it again with the field from container data before
        const command = `docker rm -f ${containerName} && docker run -d --dns 172.17.9.25 --label user=${userContainer} -e USERNAME=${username} -e PASSWORD=${password} -e PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin -e WorkingDir=/root -e NB_USER=root -e HOME=/root --user root --name ${containerName} --memory=${memoryLimit} --cpus=${cpus} ${gpuFlag} -p ${portSSH}:22 -p ${portJupyter}:8888 ${imageName} /bin/bash -c "apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo \\$USERNAME:\\$PASSWORD | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && echo 'export PATH=\\$PATH:/opt/conda/bin' >> /etc/profile && /usr/sbin/sshd -D & jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root"`;
        // const command = `docker rm -f ${containerName} && docker run -d --label user=${userContainer} -e USERNAME=${username} -e PASSWORD=${password} -e PATH=/opt/conda/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin -e WorkingDir=/root -e NB_USER=root -e HOME=/root --user root --name ${containerName} --memory=${memoryLimit} --cpus=${cpus} -p ${portSSH}:22 -p ${portJupyter}:8888 ${imageName} /bin/bash -c "apt-get update && apt-get install -y openssh-server && mkdir /var/run/sshd && echo \\$USERNAME:\\$PASSWORD | chpasswd && sed -i 's/#PermitRootLogin prohibit-password/PermitRootLogin yes/' /etc/ssh/sshd_config && sed -i 's/#PasswordAuthentication no/PasswordAuthentication yes/' /etc/ssh/sshd_config && echo 'export PATH=\\$PATH:/opt/conda/bin' >> /etc/profile && /usr/sbin/sshd -D & jupyter notebook --ip 0.0.0.0 --port 8888 --no-browser --allow-root"`;

        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.log(`error: ${error.message}`);
                    reject(error);
                }
                if (stderr) {
                    console.log(`stderr: ${stderr}`);
                    // Check if the stderr message is the specific warning about swap limit capabilities
                if (!stderr.includes('Your kernel does not support swap limit capabilities')) {
                    reject(new Error(stderr));
                }
                }
                console.log(`stdout: ${stdout}`);
                resolve(stdout);
            });
        }
        );

        await execPromise;
        res.status(201).json({
            data: {
                container
            },
            meta:{
                code: 201,
                message: 'Container reset successfully',
            }
        });
        } catch (err) {
            next (err);
        }
});
router.get('/container/:containerName', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId 
        //if not return error
        const container = await getContainerByName(containerName);

        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access this container',
                }
            });
            return;
        }

        res.status(200).json({
            data: {
                container,
            },
            meta:{
                code: 200,
                message: 'Container details retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//create endpoint for get container log by name
router.get('/container/:containerName/log', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId
        //if not return error
        const container = await getContainerByName(containerName);

        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access this container',
                }
            });
            return;
        }
        //Get container log by name using docker command

        let stdout;  // Declare stdout here
        const command = `docker logs ${containerName}`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container log:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;

        res.status(200).json({
            data: {
                log: stdout,
            },
            meta:{
                code: 200,
                message: 'Container log retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//create endpoint for delete container by name
router.delete('/container/:containerName', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        const container = await getContainerByName(containerName);

        //check only admin can delete container
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to delete this container',
                }
            });
            return;
        }


        //Delete container by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker rm -f ${containerName}`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container deleted:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;
        //if success delete container in db
        await deleteContainer(container.id);
        res.status(200).json({
            data: {
                container,
            },
            meta:{
                code: 200,
                message: 'Container deleted successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

router.get('/search/:imageName', isAuthenticated, async (req, res, next) => {
    try {
        const imageName = req.params.imageName;
        //check if the imageName is empty or only 1 character
        if (!imageName || imageName.length < 2) {
            res.status(400).json({
                data: {
                },
                meta:{
                    code: 400,
                    message: 'Bad Request: Image name must be at least 2 characters long',
                }
            });
            return;
        }
        
        console.log('Received request for searching image:', imageName);

        exec(`docker search --format '{{.Name}}|||{{.Description}}|||{{.StarCount}}|||{{.IsOfficial}},' --no-trunc ${imageName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                res.status(500).json({
                    status: false,
                    message: 'Internal Server Error',
                    stack: error.stack,
                });
                return;
            }

            console.log(`Search results:\n${stdout}`);

            // Split the output by lines
            const lines = stdout.trim().split('\n');

            // Process each line, splitting by '|||' and replacing any double quotes in the description
            const images = lines.map(line => {
                const [name, description, stars, official] = line.split('|||');
                return {
                    name,
                    description: description.replace(/"/g, '\\"'),
                    stars,
                    official,
                };
            });

            res.status(200).json({
                data: images,
                meta: {
                    code: 200,
                    message: 'Berhasil mencari docker image',
                },
            });
        });
    } catch (err) {
        next(err);
    }
});

//create endpoint for get all container in that user
router.get('/mycontainer', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req;
        console.log('Received request for user ID:', userId);
        //Get all container by userId using db
        const containers = await getContainersByUserId(userId);

        res.status(200).json({
            data: {
                containers,
            },
            meta:{
                code: 200,
                message: 'Containers retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//endpoint for get all container in all user for admin
router.get('/allcontainer', isAuthenticated, async (req, res, next) => {
    try {
        const { userId } = req;
        const user = await findUserById(userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access all containers',
                }
            });
            return;
        }
        //Get all container using db
        const containers = await getAllContainer();
        
        // Get Docker status for each container
        const containersWithStatus = await Promise.all(
            containers.map(async (container) => {
                try {
                    // Get container status from Docker
                    const statusCommand = `docker inspect ${container.name} --format '{{.State.Status}}'`;
                    const status = await new Promise((resolve) => {
                        exec(statusCommand, (error, stdout) => {
                            if (error) {
                                // Container doesn't exist in Docker
                                resolve('not_found');
                            } else {
                                resolve(stdout.trim());
                            }
                        });
                    });
                    
                    return {
                        ...container,
                        status: status === 'not_found' ? null : status
                    };
                } catch (err) {
                    // If error, return container without status
                    return {
                        ...container,
                        status: null
                    };
                }
            })
        );

        res.status(200).json({
            data: {
                containers: containersWithStatus,
            },
            meta:{
                code: 200,
                message: 'Containers retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//create endpoint for get stats container using container name and docker command with no stream
router.get('/container/:containerName/stats', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId
        //if not return error
        const container = await getContainerByName(containerName);

        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access this container',
                }
            });
            return;
        }
        //Get container stats by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker stats ${containerName} --no-stream --format "{{ json . }}"`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container stats:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;

        const stats = JSON.parse(stdout);
        res.status(200).json({
            data: {
                stats: stats,
            },
            meta:{
                code: 200,
                message: 'Container stats retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//create endpoint for restart container by name
router.post('/container/:containerName/restart', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId
        //if not return error
        const container = await getContainerByName(containerName);

        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access this container',
                }
            });
            return;
        }
        //Restart container by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker restart ${containerName} && docker exec ${containerName} service ssh start`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container restarted:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;
        
        res.status(200).json({
            data: {
                container,
            },
            meta:{
                code: 200,
                message: 'Container restarted successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//endpoint to get jupyterlink by container name
router.get('/container/:containerName/jupyterlink', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        //check in db is the container name is true with the userId
        //if not return error
        const container = await getContainerByName(containerName);

        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to access this container',
                }
            });
            return;
        }

        const jupyterLink = `http://localhost:${container.jupyterPort}`;
        res.status(200).json({
            data: {
                jupyterLink,
            },
            meta:{
                code: 200,
                message: 'Jupyter link retrieved successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//endpoint to stop docker container by name for admin
router.post('/container/:containerName/stop', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        const container = await getContainerByName(containerName);

        //check only admin can stop container
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to stop this container',
                }
            });
            return;
        }

        //Stop container by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker stop ${containerName}`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container stopped:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;

        res.status(200).json({
            data: {
                container,
            },
            meta:{
                code: 200,
                message: 'Container stopped successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//endpoint to start docker container by name for admin
router.post('/container/:containerName/start', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        const container = await getContainerByName(containerName);

        //check only admin can start container
        const user = await findUserById(req.userId);
        if (!user.isAdmin) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to start this container',
                }
            });
            return;
        }

        //Start container by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker start ${containerName} && docker exec ${containerName} service ssh start`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Container started:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;

        res.status(200).json({
            data: {
                container,
            },
            meta:{
                code: 200,
                message: 'Container started successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});

//endpoint to change password by container name
router.post('/container/:containerName/changePassword', isAuthenticated, async (req, res, next) => {
    try {
        const containerName = req.params.containerName;
        console.log('Received request for container Name:', containerName);
        const container = await getContainerByName(containerName);

        //check only user with same with container user can change password
        if (container.userId !== req.userId) {
            res.status(403).json({
                data: {
                },
                meta:{
                    code: 403,
                    message: 'Forbidden: You are not authorized to change password for this container',
                }
            });
            return;
        }

        const password = req.body.password;
        if (!password) {
            res.status(400).json({
                data: {
                },
                meta:{
                    code: 400,
                    message: 'Bad Request: Missing required fields',
                }
            });
            return;
        }

        //Change password by name using docker command
        let stdout;  // Declare stdout here
        const command = `docker exec ${containerName} bash -c "echo root:${password} | chpasswd"`;
        const execPromise = new Promise((resolve, reject) => {
            exec(command, (error, _stdout, stderr) => {
                if (error) {
                    console.error(`Error: ${error.message}`);
                    reject(error);
                }

                stdout = _stdout;  // Assign value to stdout

                console.log(`Password changed:\n${stdout}`);
                resolve(stdout);
            });
        });
        await execPromise;
        const updatedContainer = await updatePassword(containerName, password);
        res.status(200).json({
            data: {
                updatedContainer,
            },
            meta:{
                code: 200,
                message: 'Password changed successfully',
            }
        });
    } catch (err) {
        next (err);
    }
});
module.exports = router;
