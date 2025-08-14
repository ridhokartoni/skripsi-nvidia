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

// Payment Page Specific Functions
function setupPaymentPage() {
    // Payment method selection
    const paymentOptions = document.querySelectorAll('input[name="payment"]');
    const cardDetailsSection = document.querySelector('.card-details');
    
    if (paymentOptions.length > 0 && cardDetailsSection) {
        paymentOptions.forEach(option => {
            option.addEventListener('change', function() {
                // Show/hide card details based on payment method
                if (this.value === 'card') {
                    cardDetailsSection.style.display = 'block';
                    animateSection(cardDetailsSection);
                } else {
                    cardDetailsSection.style.display = 'none';
                }
                
                // Show notification for payment method change
                const methodName = this.parentElement.querySelector('.option-text').textContent;
                showNotification(`Payment method changed to ${methodName}`);
            });
        });
    }
    
    // Form validation setup
    setupFormValidation();
    
    // Card number formatting
    const cardNumberInput = document.querySelector('.card-details input[placeholder="XXXX XXXX XXXX XXXX"]');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Expiry date formatting
    const expiryInput = document.querySelector('.card-details input[placeholder="MM/YY"]');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.slice(0, 2) + '/' + value.slice(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // CVV input restriction
    const cvvInput = document.querySelector('.card-details input[placeholder="XXX"]');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
        });
    }
}

function setupFormValidation() {
    const formInputs = document.querySelectorAll('.form-input');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateInput(this);
        });
    });
}

function validateInput(input) {
    const value = input.value.trim();
    
    if (value === '') {
        input.style.borderColor = '#ff5252';
        showFieldError(input, 'This field is required');
    } else {
        input.style.borderColor = '#4caf50';
        removeFieldError(input);
    }
    
    // Email validation
    if (input.type === 'email' && value !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            input.style.borderColor = '#ff5252';
            showFieldError(input, 'Please enter a valid email');
        }
    }
}

function showFieldError(input, message) {
    // Remove existing error if any
    removeFieldError(input);
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.textContent = message;
    errorDiv.style.color = '#ff5252';
    errorDiv.style.fontSize = '12px';
    errorDiv.style.marginTop = '5px';
    
    input.parentElement.appendChild(errorDiv);
}

function removeFieldError(input) {
    const existingError = input.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function processPayment() {
    // Validate all required fields
    const requiredInputs = document.querySelectorAll('.payment-page .form-input');
    let isValid = true;
    
    requiredInputs.forEach(input => {
        if (input.value.trim() === '') {
            validateInput(input);
            isValid = false;
        }
    });
    
    if (isValid) {
        // Show processing modal
        showModal('Processing Payment', 'Your payment is being processed. Please wait...');
        
        // Simulate payment processing
        setTimeout(() => {
            // Hide modal
            const modal = document.querySelector('.modal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            // Show success notification
            showSuccessAnimation();
        }, 2000);
    } else {
        showNotification('Please fill in all required fields');
    }
}

function showSuccessAnimation() {
    // Create success overlay
    const successOverlay = document.createElement('div');
    successOverlay.className = 'success-overlay';
    successOverlay.innerHTML = `
        <div class="success-content">
            <div class="success-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p>Your order has been confirmed</p>
            <p class="order-number">Order #${generateOrderNumber()}</p>
            <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Continue Shopping</button>
        </div>
    `;
    
    // Add styles
    successOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 3000;
    `;
    
    const successContent = successOverlay.querySelector('.success-content');
    successContent.style.cssText = `
        background: white;
        padding: 40px;
        border-radius: 8px;
        text-align: center;
        animation: slideIn 0.5s ease;
    `;
    
    const successIcon = successOverlay.querySelector('.success-icon');
    successIcon.style.cssText = `
        font-size: 60px;
        color: #4caf50;
        margin-bottom: 20px;
        animation: scaleIn 0.5s ease;
    `;
    
    document.body.appendChild(successOverlay);
}

function generateOrderNumber() {
    return 'ORD' + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function animateSection(element) {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        element.style.transition = 'all 0.5s ease';
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 100);
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
