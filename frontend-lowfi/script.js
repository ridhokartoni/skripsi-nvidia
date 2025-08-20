// Low-Fidelity Frontend JavaScript
// This file contains basic interactivity for the wireframe design

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    init();
});

function init() {
    // Setup navigation
    setupNavigation();
    
    // Setup section interactions
    setupSectionInteractions();
    
    // Setup card interactions
    setupCardInteractions();
    
    // Setup sidebar
    setupSidebar();
    
    // Setup buttons
    setupButtons();
    
    // Add smooth scrolling
    setupSmoothScrolling();
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Log navigation action (for demo purposes)
            console.log('Navigated to:', this.textContent);
        });
    });
}

// Section interactions
function setupSectionInteractions() {
    // Setup payment page functionality if it exists
    setupPaymentPage();
    
    // Add hover effects to content blocks (excluding payment blocks)
    const contentBlocks = document.querySelectorAll('.content-block-secondary');
    
    contentBlocks.forEach(block => {
        block.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.02)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        block.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
        
        block.addEventListener('click', function() {
            // Toggle selected state
            this.classList.toggle('selected');
            
            // Visual feedback
            if (this.classList.contains('selected')) {
                this.style.borderColor = '#007bff';
                this.style.backgroundColor = '#e7f3ff';
            } else {
                this.style.borderColor = '';
                this.style.backgroundColor = '';
            }
        });
    });
}

// Card interactions
function setupCardInteractions() {
    const cards = document.querySelectorAll('.card');
    
    cards.forEach((card, index) => {
        // Add click handler
        card.addEventListener('click', function() {
            // Toggle expanded state
            this.classList.toggle('expanded');
            
            // Create or remove detailed content
            if (this.classList.contains('expanded')) {
                const details = document.createElement('div');
                details.className = 'card-details';
                details.innerHTML = `
                    <p>Additional details for Card ${index + 1}</p>
                    <ul>
                        <li>Feature 1</li>
                        <li>Feature 2</li>
                        <li>Feature 3</li>
                    </ul>
                `;
                this.querySelector('.card-body').appendChild(details);
            } else {
                const details = this.querySelector('.card-details');
                if (details) {
                    details.remove();
                }
            }
        });
        
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.boxShadow = '';
        });
    });
}

// Sidebar functionality
function setupSidebar() {
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const mainArea = document.querySelector('.main-area');
    
    sidebarItems.forEach((item, index) => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(i => i.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            this.style.backgroundColor = '#333';
            this.style.color = '#fff';
            
            // Update main area content (simulation)
            updateMainContent(index + 1);
        });
    });
}

// Update main content based on sidebar selection
function updateMainContent(itemNumber) {
    const cardGrid = document.querySelector('.card-grid');
    
    // Add loading animation
    cardGrid.style.opacity = '0.5';
    
    setTimeout(() => {
        // Simulate content update
        console.log(`Loading content for Item ${itemNumber}`);
        cardGrid.style.opacity = '1';
        
        // Add notification
        showNotification(`Content updated for Item ${itemNumber}`);
    }, 300);
}

// Button functionality
function setupButtons() {
    // Primary button action (header button)
    const primaryBtn = document.querySelector('.nav-right .btn-primary');
    if (primaryBtn) {
        primaryBtn.addEventListener('click', function() {
            showModal('Primary Action', 'This would trigger the main action of the application.');
        });
    }
    
    // Payment page buttons
    const completePaymentBtn = document.querySelector('.payment-actions .btn-primary');
    if (completePaymentBtn) {
        completePaymentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            processPayment();
        });
    }
    
    const backToCartBtn = document.querySelector('.payment-actions .btn-secondary');
    if (backToCartBtn) {
        backToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            showNotification('Returning to cart...');
        });
    }
    
    // Filter button (if it exists outside payment page)
    const filterBtn = document.querySelector('.layout-b .btn-secondary:nth-of-type(1)');
    if (filterBtn) {
        filterBtn.addEventListener('click', function() {
            toggleFilterPanel();
        });
    }
    
    // Sort button (if it exists outside payment page)
    const sortBtn = document.querySelector('.layout-b .btn-secondary:nth-of-type(2)');
    if (sortBtn) {
        sortBtn.addEventListener('click', function() {
            toggleSortOptions();
        });
    }
}

// Toggle filter panel
function toggleFilterPanel() {
    let filterPanel = document.querySelector('.filter-panel');
    
    if (!filterPanel) {
        // Create filter panel
        filterPanel = document.createElement('div');
        filterPanel.className = 'filter-panel';
        filterPanel.innerHTML = `
            <div class="filter-content">
                <h3>Filter Options</h3>
                <label><input type="checkbox"> Option 1</label>
                <label><input type="checkbox"> Option 2</label>
                <label><input type="checkbox"> Option 3</label>
                <button class="apply-filter">Apply</button>
            </div>
        `;
        
        const layoutA = document.querySelector('.layout-a .container');
        layoutA.insertBefore(filterPanel, layoutA.querySelector('.grid-container'));
        
        // Add apply button handler
        filterPanel.querySelector('.apply-filter').addEventListener('click', function() {
            filterPanel.style.display = 'none';
            showNotification('Filters applied');
        });
    } else {
        // Toggle visibility
        filterPanel.style.display = filterPanel.style.display === 'none' ? 'block' : 'none';
    }
}

// Toggle sort options
function toggleSortOptions() {
    let sortPanel = document.querySelector('.sort-panel');
    
    if (!sortPanel) {
        // Create sort panel
        sortPanel = document.createElement('div');
        sortPanel.className = 'sort-panel';
        sortPanel.innerHTML = `
            <div class="sort-content">
                <h3>Sort By</h3>
                <label><input type="radio" name="sort" value="name"> Name</label>
                <label><input type="radio" name="sort" value="date"> Date</label>
                <label><input type="radio" name="sort" value="size"> Size</label>
                <button class="apply-sort">Apply</button>
            </div>
        `;
        
        const layoutA = document.querySelector('.layout-a .container');
        layoutA.insertBefore(sortPanel, layoutA.querySelector('.grid-container'));
        
        // Add apply button handler
        sortPanel.querySelector('.apply-sort').addEventListener('click', function() {
            sortPanel.style.display = 'none';
            showNotification('Sorting applied');
        });
    } else {
        // Toggle visibility
        sortPanel.style.display = sortPanel.style.display === 'none' ? 'block' : 'none';
    }
}

// Show modal dialog
function showModal(title, message) {
    // Create modal if it doesn't exist
    let modal = document.querySelector('.modal');
    
    if (!modal) {
        modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 class="modal-title">${title}</h2>
                    <span class="modal-close">&times;</span>
                </div>
                <div class="modal-body">
                    <p>${message}</p>
                </div>
                <div class="modal-footer">
                    <button class="modal-btn">OK</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close handlers
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        modal.querySelector('.modal-btn').addEventListener('click', () => {
            modal.style.display = 'none';
        });
        
        // Close on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    } else {
        // Update content
        modal.querySelector('.modal-title').textContent = title;
        modal.querySelector('.modal-body p').textContent = message;
    }
    
    // Show modal
    modal.style.display = 'flex';
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to body
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add dynamic styling for interactive elements
const style = document.createElement('style');
style.textContent = `
    .active {
        font-weight: bold;
        color: #007bff !important;
    }
    
    .selected {
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
    }
    
    .expanded .card-details {
        margin-top: 15px;
        padding-top: 15px;
        border-top: 1px solid #ddd;
        animation: slideDown 0.3s ease;
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .filter-panel, .sort-panel {
        background: #f9f9f9;
        border: 2px solid #ddd;
        padding: 20px;
        margin-bottom: 20px;
        border-radius: 4px;
    }
    
    .filter-content label, .sort-content label {
        display: block;
        margin: 10px 0;
        cursor: pointer;
    }
    
    .apply-filter, .apply-sort {
        margin-top: 15px;
        padding: 8px 20px;
        background: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }
    
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    
    .modal-content {
        background: white;
        padding: 0;
        border-radius: 8px;
        width: 90%;
        max-width: 500px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #ddd;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-close {
        font-size: 28px;
        cursor: pointer;
        color: #999;
    }
    
    .modal-close:hover {
        color: #333;
    }
    
    .modal-body {
        padding: 20px;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #ddd;
        text-align: right;
    }
    
    .modal-btn {
        padding: 8px 20px;
        background: #007bff;
        color: white;
        border: none;
        cursor: pointer;
        border-radius: 4px;
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        z-index: 2000;
    }
    
    .notification.show {
        opacity: 1;
        transform: translateY(0);
    }
`;

document.head.appendChild(style);

// Container Management Page Functions
function setupPaymentPage() {
    // This function is now setupContainerManagement
    setupContainerManagement();
}

function setupContainerManagement() {
    // Setup container card interactions
    const containerCards = document.querySelectorAll('.container-card:not(.empty-state)');
    
    containerCards.forEach(card => {
        // Add hover effect
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        // Setup action buttons
        const detailsBtn = card.querySelector('.btn-details');
        const restartBtn = card.querySelector('.btn-restart');
        const resetBtn = card.querySelector('.btn-reset');
        const containerName = card.querySelector('.container-name').textContent;
        const statusBadge = card.querySelector('.status-badge');
        
        if (detailsBtn) {
            detailsBtn.addEventListener('click', function() {
                showContainerDetails(containerName);
            });
        }
        
        if (restartBtn && !restartBtn.disabled) {
            restartBtn.addEventListener('click', function() {
                restartContainer(containerName, card);
            });
        }
        
        if (resetBtn && !resetBtn.disabled) {
            resetBtn.addEventListener('click', function() {
                resetContainer(containerName, card);
            });
        }
        
        // Copy password on click
        const passwordBox = card.querySelector('.password-box');
        if (passwordBox) {
            passwordBox.style.cursor = 'pointer';
            passwordBox.addEventListener('click', function() {
                copyToClipboard(this.textContent);
                showNotification('Password copied to clipboard!');
            });
        }
    });
    
    // Setup request new container button
    const requestBtns = document.querySelectorAll('.container-management .btn-primary');
    requestBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showModal('Request New Container', 'Select a package configuration for your new GPU container.');
        });
    });
    
    // Simulate real-time status updates
    startStatusUpdates();
}

function showContainerDetails(containerName) {
    const modal = document.createElement('div');
    modal.className = 'container-details-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>Container Details: ${containerName}</h2>
                <span class="modal-close">×</span>
            </div>
            <div class="modal-body">
                <div class="detail-section">
                    <h3>Connection Information</h3>
                    <div class="detail-row">
                        <span class="detail-label">SSH Command:</span>
                        <code class="detail-code">ssh user@gpu-server.com -p 2201</code>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Jupyter URL:</span>
                        <code class="detail-code">http://gpu-server.com:8888/lab</code>
                    </div>
                </div>
                <div class="detail-section">
                    <h3>Resource Usage</h3>
                    <div class="usage-bar">
                        <span class="usage-label">CPU Usage:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 45%">45%</div>
                        </div>
                    </div>
                    <div class="usage-bar">
                        <span class="usage-label">Memory:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 62%">62%</div>
                        </div>
                    </div>
                    <div class="usage-bar">
                        <span class="usage-label">GPU:</span>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: 78%">78%</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button class="btn-primary">Open Terminal</button>
                <button class="btn-secondary">View Logs</button>
            </div>
        </div>
    `;
    
    // Style the modal
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    const modalContent = modal.querySelector('.modal-content');
    modalContent.style.cssText = `
        background: white;
        width: 90%;
        max-width: 600px;
        border: 2px solid #333;
        border-radius: 0;
        max-height: 80vh;
        overflow-y: auto;
    `;
    
    // Add close functionality
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
    
    document.body.appendChild(modal);
    
    // Add styles for the modal
    if (!document.querySelector('#container-modal-styles')) {
        const styles = document.createElement('style');
        styles.id = 'container-modal-styles';
        styles.textContent = `
            .container-details-modal .modal-header {
                padding: 20px;
                border-bottom: 2px solid #ddd;
                display: flex;
                justify-content: space-between;
                align-items: center;
                background-color: #f5f5f5;
            }
            .container-details-modal .modal-close {
                font-size: 28px;
                cursor: pointer;
                color: #999;
            }
            .container-details-modal .modal-body {
                padding: 20px;
            }
            .detail-section {
                margin-bottom: 25px;
            }
            .detail-section h3 {
                font-size: 16px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #666;
            }
            .detail-row {
                margin-bottom: 10px;
            }
            .detail-label {
                display: inline-block;
                width: 120px;
                font-weight: 600;
                color: #666;
            }
            .detail-code {
                background-color: #333;
                color: #0f0;
                padding: 5px 10px;
                font-family: 'Courier New', monospace;
                font-size: 13px;
            }
            .usage-bar {
                margin-bottom: 15px;
            }
            .usage-label {
                display: block;
                margin-bottom: 5px;
                font-size: 14px;
                color: #666;
            }
            .progress-bar {
                width: 100%;
                height: 25px;
                background-color: #f0f0f0;
                border: 2px solid #ddd;
                position: relative;
            }
            .progress-fill {
                height: 100%;
                background-color: #4caf50;
                color: white;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
                font-weight: bold;
            }
            .container-details-modal .modal-footer {
                padding: 20px;
                border-top: 2px solid #ddd;
                display: flex;
                gap: 10px;
                background-color: #f5f5f5;
            }
        `;
        document.head.appendChild(styles);
    }
}

function restartContainer(containerName, cardElement) {
    const restartBtn = cardElement.querySelector('.btn-restart');
    const originalText = restartBtn.innerHTML;
    
    // Show loading state
    restartBtn.innerHTML = '<span class="loading-spinner"></span> Restarting...';
    restartBtn.disabled = true;
    
    // Simulate restart process
    setTimeout(() => {
        showNotification(`Container ${containerName} restarted successfully`);
        restartBtn.innerHTML = originalText;
        restartBtn.disabled = false;
        
        // Update status to running
        const statusBadge = cardElement.querySelector('.status-badge');
        statusBadge.className = 'status-badge status-running';
        statusBadge.textContent = '● Running';
    }, 2000);
}

function resetContainer(containerName, cardElement) {
    // Confirm reset
    if (confirm(`Are you sure you want to reset ${containerName}? This will remove all data.`)) {
        const resetBtn = cardElement.querySelector('.btn-reset');
        const originalText = resetBtn.innerHTML;
        
        // Show loading state
        resetBtn.innerHTML = '<span class="loading-spinner"></span> Resetting...';
        resetBtn.disabled = true;
        
        // Simulate reset process
        setTimeout(() => {
            showNotification(`Container ${containerName} reset successfully`);
            resetBtn.innerHTML = originalText;
            resetBtn.disabled = false;
            
            // Update status
            const statusBadge = cardElement.querySelector('.status-badge');
            statusBadge.className = 'status-badge status-creating';
            statusBadge.textContent = '● Creating';
            
            // After a delay, set to running
            setTimeout(() => {
                statusBadge.className = 'status-badge status-running';
                statusBadge.textContent = '● Running';
            }, 3000);
        }, 2000);
    }
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

function startStatusUpdates() {
    // Simulate real-time status updates
    setInterval(() => {
        const stats = document.querySelectorAll('.stat-value');
        if (stats.length > 0) {
            // Update GPU usage randomly
            const gpuStat = stats[3];
            if (gpuStat && gpuStat.textContent.includes('GPU')) {
                const currentGPUs = Math.floor(Math.random() * 5) + 1;
                gpuStat.textContent = `${currentGPUs}/8 GPUs`;
            }
        }
    }, 5000);
    
    // Add spinner styles if not already added
    if (!document.querySelector('#spinner-styles')) {
        const spinnerStyle = document.createElement('style');
        spinnerStyle.id = 'spinner-styles';
        spinnerStyle.textContent = `
            .loading-spinner {
                display: inline-block;
                width: 12px;
                height: 12px;
                border: 2px solid #ddd;
                border-top-color: #333;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinnerStyle);
    }
}

// Add animation keyframes
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes scaleIn {
        from {
            transform: scale(0);
        }
        to {
            transform: scale(1);
        }
    }
`;
document.head.appendChild(animationStyles);
