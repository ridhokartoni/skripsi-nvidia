import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, CommandLineIcon, KeyIcon } from '@heroicons/react/24/outline';

interface SSHGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sshPort: string;
  password: string;
}

export default function SSHGuideModal({
  isOpen,
  onClose,
  sshPort,
  password,
}: SSHGuideModalProps) {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      SSH & Jupyter Notebook Access Guide
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-6 max-h-[70vh] overflow-y-auto">
                    {/* SSH Connection Guide */}
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <CommandLineIcon className="h-5 w-5 mr-2 text-blue-600" />
                        How to Connect via SSH
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 1: Open Terminal</p>
                          <ul className="text-sm text-gray-600 ml-4 list-disc">
                            <li><strong>Windows:</strong> Use PowerShell, Command Prompt, or Windows Terminal</li>
                            <li><strong>macOS/Linux:</strong> Open Terminal application</li>
                          </ul>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 2: Run SSH Command</p>
                          <div className="bg-gray-900 rounded p-3 mt-1">
                            <code className="text-green-400 text-sm font-mono">
                              ssh root@localhost -p {sshPort}
                            </code>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 3: Enter Password</p>
                          <p className="text-sm text-gray-600">When prompted, enter the password:</p>
                          <div className="bg-white border border-gray-200 rounded px-3 py-2 mt-1">
                            <code className="text-sm font-mono text-gray-800">{password}</code>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Note: The password won't be visible while typing</p>
                        </div>
                      </div>
                    </div>

                    {/* Jupyter Password Reset Guide */}
                    <div className="bg-purple-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
                        <KeyIcon className="h-5 w-5 mr-2 text-purple-600" />
                        How to Reset Jupyter Notebook Password
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 1: Connect to Container via SSH</p>
                          <p className="text-sm text-gray-600">Follow the SSH connection steps above first</p>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 2: Generate New Jupyter Password</p>
                          <p className="text-sm text-gray-600 mb-2">Once connected via SSH, run this command:</p>
                          <div className="bg-gray-900 rounded p-3">
                            <code className="text-green-400 text-sm font-mono">
                              jupyter notebook password
                            </code>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 3: Enter Your New Password</p>
                          <p className="text-sm text-gray-600">You'll be prompted twice:</p>
                          <div className="bg-gray-900 rounded p-3 text-sm font-mono space-y-1">
                            <div className="text-green-400">Enter password: <span className="text-gray-500">[type your new password]</span></div>
                            <div className="text-green-400">Verify password: <span className="text-gray-500">[type it again]</span></div>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 4: Restart Jupyter (Optional)</p>
                          <p className="text-sm text-gray-600 mb-2">If Jupyter is already running, restart it:</p>
                          <div className="bg-gray-900 rounded p-3 space-y-1">
                            <code className="text-green-400 text-sm font-mono block">
                              pkill jupyter
                            </code>
                            <code className="text-green-400 text-sm font-mono block">
                              nohup jupyter notebook --allow-root --ip=0.0.0.0 --no-browser &
                            </code>
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Step 5: Access Jupyter with New Password</p>
                          <p className="text-sm text-gray-600">
                            Click "Open Jupyter Notebook" button and use your new password to login
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Additional Tips */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">💡 Tips</h4>
                      <ul className="text-sm text-gray-600 space-y-2">
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>If SSH connection fails, ensure the container is running and the port is correct</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>For security, change both SSH and Jupyter passwords regularly</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>To check Jupyter status: <code className="bg-white px-1 rounded border text-xs">ps aux | grep jupyter</code></span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span>To view Jupyter logs: <code className="bg-white px-1 rounded border text-xs">cat nohup.out</code></span>
                        </li>
                      </ul>
                    </div>

                    {/* Common Issues */}
                    <div className="bg-yellow-50 rounded-lg p-4">
                      <h4 className="text-md font-semibold text-gray-900 mb-3">⚠️ Troubleshooting</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <p className="font-medium text-gray-700">SSH Connection Refused?</p>
                          <p className="text-gray-600">Check if container is running and SSH service is active</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Jupyter Not Accessible?</p>
                          <p className="text-gray-600">Ensure Jupyter is running and firewall allows the port</p>
                        </div>
                        <div>
                          <p className="font-medium text-gray-700">Forgot Password?</p>
                          <p className="text-gray-600">Contact admin to reset container password</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                      onClick={onClose}
                    >
                      Close Guide
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
