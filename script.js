// Blog data storage
let blogs = [
    { id: 'ai', title: 'AI Blog', icon: '🤖', description: 'Dive into Artificial Intelligence', folder: 'ai.html' }
];

// Animation types array
const animationTypes = ['ripple', 'pulse', 'bounce', 'glow', 'flip', 'shake'];
let currentAnimationType = 0;

// Navigation function with animation
function navigateTo(path, element) {
    // Get current animation type
    const animationType = animationTypes[currentAnimationType % animationTypes.length];
    
    // Apply animation
    applyClickAnimation(element, animationType);
    
    // Navigate after animation
    setTimeout(() => {
        window.location.href = path;
    }, animationType === 'flip' ? 400 : 300);
    
    // Cycle to next animation type
    currentAnimationType++;
}

// Apply click animation
function applyClickAnimation(element, type) {
    // Remove any existing animation classes
    element.classList.remove('clicked', 'pulse', 'bounce', 'glow', 'flip', 'shake');
    
    switch(type) {
        case 'ripple':
            element.classList.add('clicked');
            break;
        case 'pulse':
            element.classList.add('pulse');
            break;
        case 'bounce':
            element.classList.add('bounce');
            break;
        case 'glow':
            element.classList.add('glow');
            break;
        case 'flip':
            element.classList.add('flip');
            break;
        case 'shake':
            element.classList.add('shake');
            break;
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        element.classList.remove('clicked', 'pulse', 'bounce', 'glow', 'flip', 'shake');
    }, 800);
}

// Add new blog dynamically
function addBlog(blogData) {
    blogs.push(blogData);
    renderBlogs();
}

// Render all blogs
function renderBlogs() {
    const blogGrid = document.getElementById('blogGrid');
    blogGrid.innerHTML = '';
    
    blogs.forEach(blog => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        blogCard.onclick = (e) => {
            e.preventDefault();
            navigateTo(blog.folder, blogCard);
        };
        
        blogCard.innerHTML = `
            <div class="card-content">
                <div class="icon">${blog.icon}</div>
                <h3>${blog.title}</h3>
                <p>${blog.description}</p>
            </div>
            <div class="card-glow"></div>
        `;
        
        blogGrid.appendChild(blogCard);
    });
}

// Check for new blogs on page load
document.addEventListener('DOMContentLoaded', () => {
    checkForNewBlogs();
    renderBlogs();
});

// Function to check for new blog folders
function checkForNewBlogs() {
    // This would typically check the blog directory for new folders
    // For now, we'll simulate checking for a cloud blog
    const cloudBlogExists = localStorage.getItem('cloudBlogCreated');
    
    if (cloudBlogExists && !blogs.find(blog => blog.id === 'cloud')) {
        addBlog({
            id: 'cloud',
            title: 'Cloud Blog',
            icon: '☁️',
            description: 'Explore Cloud Technologies',
            folder: 'cloud'
        });
    }
}

// Function to create a new blog (call this when creating a new blog)
function createNewBlog(blogType) {
    if (blogType === 'cloud') {
        localStorage.setItem('cloudBlogCreated', 'true');
        addBlog({
            id: 'cloud',
            title: 'Cloud Blog',
            icon: '☁️',
            description: 'Explore Cloud Technologies',
            folder: 'cloud'
        });
    }
}

// Initialize
renderBlogs();