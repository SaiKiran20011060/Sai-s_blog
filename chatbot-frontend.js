class AIChatbot {
    constructor() {
        this.isOpen = localStorage.getItem('chatbotOpen') === 'true';
        this.messages = JSON.parse(localStorage.getItem('chatbotMessages') || '[]');
        this.initializeElements();
        this.bindEvents();
        this.restoreState();
        this.restoreMessages();
    }

    initializeElements() {
        this.toggle = document.getElementById('chatbot-toggle');
        this.window = document.getElementById('chatbot-window');
        this.closeBtn = document.getElementById('chatbot-close');
        this.refreshBtn = document.getElementById('chatbot-refresh');
        this.messagesContainer = document.getElementById('chatbot-messages');
        this.input = document.getElementById('chatbot-input');
        this.sendBtn = document.getElementById('chatbot-send');
    }

    bindEvents() {
        this.toggle.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());
        this.refreshBtn.addEventListener('click', () => this.clearChat());
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.window.style.display = this.isOpen ? 'flex' : 'none';
        localStorage.setItem('chatbotOpen', this.isOpen);
        if (this.isOpen) {
            this.input.focus();
        }
    }

    closeChat() {
        this.isOpen = false;
        this.window.style.display = 'none';
        localStorage.setItem('chatbotOpen', 'false');
    }

    restoreState() {
        this.window.style.display = this.isOpen ? 'flex' : 'none';
    }

    restoreMessages() {
        if (this.messages.length === 0) {
            this.addWelcomeMessage();
        } else {
            this.messages.forEach(msg => {
                const messageDiv = document.createElement('div');
                messageDiv.className = `message ${msg.sender}-message`;
                
                if (msg.sender === 'bot') {
                    messageDiv.innerHTML = `
                        <div class="message-avatar">🤖</div>
                        <div class="message-content">${this.formatMessage(msg.text)}</div>
                    `;
                } else {
                    messageDiv.innerHTML = `
                        <div class="message-content">${msg.text}</div>
                        <div class="message-avatar">👤</div>
                    `;
                }
                
                this.messagesContainer.appendChild(messageDiv);
            });
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    addWelcomeMessage() {
        const welcomeMsg = "Hi! I'm your AI/ML assistant. Ask me about machine learning concepts, algorithms, or any AI-related questions!";
        this.addMessage(welcomeMsg, 'bot');
    }

    clearChat() {
        this.messages = [];
        this.messagesContainer.innerHTML = '';
        localStorage.removeItem('chatbotMessages');
        this.addWelcomeMessage();
    }

    addMessage(text, sender) {
        const messageObj = { text, sender, timestamp: Date.now() };
        this.messages.push(messageObj);
        localStorage.setItem('chatbotMessages', JSON.stringify(this.messages));
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        if (sender === 'bot') {
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">${this.formatMessage(text)}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">${text}</div>
                <div class="message-avatar">👤</div>
            `;
        }
        
        this.messagesContainer.appendChild(messageDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }

    formatMessage(text) {
        // Basic markdown-like formatting
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            .replace(/\n/g, '<br>');
    }

    showTyping() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing';
        typingDiv.innerHTML = `
            <div class="message-avatar">🤖</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        this.messagesContainer.appendChild(typingDiv);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        return typingDiv;
    }

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;

        this.addMessage(message, 'user');
        this.input.value = '';

        const typingIndicator = this.showTyping();

        try {
            const response = await this.callChatAPI(message);
            typingIndicator.remove();
            this.addMessage(response, 'bot');
        } catch (error) {
            typingIndicator.remove();
            this.addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        }
    }

    async callChatAPI(message) {
        // For demo purposes, using a mock response
        // Replace this with actual API call when backend is running
        return this.getMockResponse(message);
        
        /* Uncomment when backend is ready:
        const response = await fetch('http://localhost:5000/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: message })
        });
        
        const data = await response.json();
        return data.response;
        */
    }

    getMockResponse(message) {
        const responses = {
            'machine learning': 'Machine Learning is a subset of AI that enables computers to learn and make decisions from data without being explicitly programmed. It includes **supervised learning** (with labeled data), **unsupervised learning** (finding patterns), and **reinforcement learning** (learning through rewards).',
            
            'neural network': 'A **Neural Network** is inspired by the human brain and consists of interconnected nodes (neurons) organized in layers. Each connection has a weight, and the network learns by adjusting these weights through backpropagation.',
            
            'overfitting': '**Overfitting** occurs when a model learns the training data too well, including noise and irrelevant patterns. This makes it perform poorly on new data. Solutions include regularization, cross-validation, and using more training data.',
            
            'supervised learning': '**Supervised Learning** uses labeled training data to learn a mapping from inputs to outputs. Common types include:\n• **Classification**: Predicting categories (spam/not spam)\n• **Regression**: Predicting continuous values (house prices)',
            
            'unsupervised learning': '**Unsupervised Learning** finds hidden patterns in data without labeled examples. Main types:\n• **Clustering**: Grouping similar data points\n• **Association**: Finding relationships between variables\n• **Dimensionality Reduction**: Simplifying data while preserving important features',
            
            'deep learning': '**Deep Learning** uses neural networks with multiple hidden layers to learn complex patterns. It excels in image recognition, natural language processing, and speech recognition. Popular architectures include CNNs, RNNs, and Transformers.',
            
            'artificial intelligence': '**Artificial Intelligence (AI)** is the simulation of human intelligence in machines. It includes machine learning, natural language processing, computer vision, robotics, and expert systems. AI can be narrow (specific tasks) or general (human-like reasoning).',
            
            'classification': '**Classification** predicts discrete categories or classes. Examples:\n• Email spam detection\n• Image recognition (cat, dog, bird)\n• Medical diagnosis\n• Sentiment analysis\nCommon algorithms: Decision Trees, SVM, Random Forest, Neural Networks.',
            
            'regression': '**Regression** predicts continuous numerical values. Examples:\n• House price prediction\n• Stock market forecasting\n• Temperature prediction\n• Sales revenue estimation\nCommon algorithms: Linear Regression, Polynomial Regression, Random Forest Regression.',
            
            'clustering': '**Clustering** groups similar data points without predefined labels. Types:\n• **K-means**: Partitions data into k clusters\n• **Hierarchical**: Creates tree-like cluster structures\n• **DBSCAN**: Finds clusters of varying shapes\nApplications: Customer segmentation, gene analysis, market research.',
            
            'reinforcement learning': '**Reinforcement Learning** learns through interaction with an environment using rewards and penalties. Key concepts:\n• **Agent**: The learner\n• **Environment**: The world the agent interacts with\n• **Actions**: What the agent can do\n• **Rewards**: Feedback from actions\nApplications: Game playing, robotics, autonomous vehicles.',
            
            'natural language processing': '**Natural Language Processing (NLP)** enables computers to understand and generate human language. Applications:\n• Text classification\n• Machine translation\n• Chatbots\n• Sentiment analysis\n• Text summarization\nTechniques: Tokenization, Named Entity Recognition, Word embeddings.',
            
            'computer vision': '**Computer Vision** enables machines to interpret visual information. Applications:\n• Image classification\n• Object detection\n• Facial recognition\n• Medical imaging\n• Autonomous vehicles\nTechniques: CNNs, Image preprocessing, Feature extraction.',
            
            'gradient descent': '**Gradient Descent** is an optimization algorithm used to minimize the cost function in machine learning. It iteratively adjusts parameters in the direction of steepest descent. Variants:\n• **Batch GD**: Uses entire dataset\n• **Stochastic GD**: Uses one sample at a time\n• **Mini-batch GD**: Uses small batches',
            
            'backpropagation': '**Backpropagation** is the algorithm used to train neural networks. It calculates gradients by propagating errors backward through the network layers, then updates weights using gradient descent to minimize the loss function.',
            
            'convolutional neural network': '**Convolutional Neural Networks (CNNs)** are designed for processing grid-like data such as images. Key components:\n• **Convolutional layers**: Apply filters to detect features\n• **Pooling layers**: Reduce spatial dimensions\n• **Fully connected layers**: Make final predictions\nExcellent for image recognition and computer vision tasks.',
            
            'recurrent neural network': '**Recurrent Neural Networks (RNNs)** are designed for sequential data. They have memory to remember previous inputs. Variants:\n• **LSTM**: Long Short-Term Memory (solves vanishing gradient)\n• **GRU**: Gated Recurrent Unit (simpler than LSTM)\nApplications: Language modeling, time series prediction, speech recognition.',
            
            'transformer': '**Transformers** use attention mechanisms to process sequences in parallel, making them very efficient. Key features:\n• **Self-attention**: Relates different positions in a sequence\n• **Multi-head attention**: Multiple attention mechanisms\n• **Positional encoding**: Adds position information\nUsed in: GPT, BERT, ChatGPT, and other large language models.',
            
            'bias': '**Bias in AI** refers to systematic errors or unfairness in algorithms. Types:\n• **Data bias**: Biased training data\n• **Algorithmic bias**: Biased model design\n• **Confirmation bias**: Seeking confirming evidence\nSolutions: Diverse datasets, fairness metrics, bias testing, inclusive development teams.',
            
            'feature engineering': '**Feature Engineering** is the process of selecting, modifying, or creating features from raw data to improve model performance. Techniques:\n• **Feature selection**: Choosing relevant features\n• **Feature scaling**: Normalizing feature ranges\n• **Feature creation**: Combining existing features\n• **Dimensionality reduction**: Reducing feature count'
        };

        // Enhanced keyword matching
        const lowerMessage = message.toLowerCase();
        
        // General conversation responses
        const generalResponses = {
            'hello': 'Hello! 👋 I\'m here to help you learn about AI and machine learning. What would you like to explore today?',
            'hi': 'Hi there! 😊 Ready to dive into some AI concepts? Ask me anything!',
            'hey': 'Hey! 🤖 I\'m your AI learning companion. What can I help you understand today?',
            'good morning': 'Good morning! ☀️ Perfect time to learn something new about AI. What interests you?',
            'good afternoon': 'Good afternoon! 🌤️ How can I help you with AI concepts today?',
            'good evening': 'Good evening! 🌙 Ready for some AI learning? What would you like to know?',
            'how are you': 'I\'m doing great, thanks for asking! 😊 I\'m excited to help you learn about AI. How are you doing?',
            'thank you': 'You\'re very welcome! 😊 I\'m happy to help. Feel free to ask more questions anytime!',
            'thanks': 'No problem at all! 👍 I\'m here whenever you need help with AI concepts.',
            'bye': 'Goodbye! 👋 Keep exploring and learning about AI. I\'ll be here when you need me!',
            'goodbye': 'See you later! 🤖 Happy learning, and don\'t hesitate to come back with more questions!',
            'who are you': 'I\'m your AI learning assistant! 🤖 I\'m here to help you understand machine learning, deep learning, and all things AI. Think of me as your study buddy!',
            'what can you do': 'I can help you learn about AI concepts like machine learning, neural networks, deep learning, computer vision, NLP, and much more! I can explain algorithms, answer questions, and guide your AI learning journey. 📚',
            'help': 'I\'m here to help! 🆘 You can ask me about any AI or machine learning topic. Try questions like "What is machine learning?", "How do neural networks work?", or "Explain deep learning".'
        };
        
        // Check for general responses first
        for (const [key, response] of Object.entries(generalResponses)) {
            if (lowerMessage.includes(key)) {
                return new Promise(resolve => {
                    setTimeout(() => resolve(response), 1000);
                });
            }
        }
        
        // Direct AI keyword matching
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return new Promise(resolve => {
                    setTimeout(() => resolve(response), 1000);
                });
            }
        }
        
        // Additional keyword mappings
        const keywordMappings = {
            'cnn': 'convolutional neural network',
            'rnn': 'recurrent neural network',
            'lstm': 'recurrent neural network',
            'gru': 'recurrent neural network',
            'nlp': 'natural language processing',
            'cv': 'computer vision',
            'ml': 'machine learning',
            'ai': 'artificial intelligence',
            'backprop': 'backpropagation',
            'gradient': 'gradient descent',
            'overfitting': 'overfitting',
            'underfitting': 'overfitting'
        };
        
        for (const [keyword, mappedKey] of Object.entries(keywordMappings)) {
            if (lowerMessage.includes(keyword) && responses[mappedKey]) {
                return new Promise(resolve => {
                    setTimeout(() => resolve(responses[mappedKey]), 1000);
                });
            }
        }
        
        // Context-aware responses
        if (lowerMessage.includes('what is') || lowerMessage.includes('define') || lowerMessage.includes('explain')) {
            return new Promise(resolve => {
                setTimeout(() => resolve("I can explain various AI concepts! Try asking about: machine learning, neural networks, deep learning, supervised/unsupervised learning, classification, regression, clustering, NLP, computer vision, or any specific AI algorithm."), 1000);
            });
        }
        
        if (lowerMessage.includes('how') && (lowerMessage.includes('work') || lowerMessage.includes('train'))) {
            return new Promise(resolve => {
                setTimeout(() => resolve("I can explain how AI algorithms work! Ask me about specific topics like 'how does machine learning work', 'how to train neural networks', 'how does backpropagation work', etc."), 1000);
            });
        }

        return new Promise(resolve => {
            setTimeout(() => resolve("I'm here to help with AI and machine learning questions! I can explain concepts like neural networks, machine learning algorithms, deep learning, NLP, computer vision, and more. What would you like to learn about?"), 1000);
        });
    }
}

// Initialize chatbot when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AIChatbot();
});