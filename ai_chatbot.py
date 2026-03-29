import google.generativeai as genai
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure Gemini API
genai.configure(api_key="AIzaSyCt5aGPMAPiMPw1Bke6A3dMubKQ8tL3XZo")

class AIChatbot:
    def __init__(self):
        self.model = genai.GenerativeModel("gemini-1.5-flash")
        self.ai_knowledge_base = """
        You are a comprehensive AI/ML expert chatbot covering ALL aspects of Artificial Intelligence and Machine Learning.
        
        **📚 AI/ML FUNDAMENTALS:**
        - Supervised Learning: Classification, Regression (Linear, Logistic, SVM, Decision Trees, Random Forest)
        - Unsupervised Learning: Clustering (K-means, Hierarchical), Dimensionality Reduction (PCA, t-SNE)
        - Reinforcement Learning: Q-learning, Policy Gradient, Actor-Critic
        - Model Evaluation: Cross-validation, Confusion Matrix, ROC-AUC, Precision, Recall, F1-score
        - Data Preprocessing: Feature Engineering, Normalization, Handling Missing Data
        
        **🧠 DEEP LEARNING:**
        - Neural Networks: Perceptrons, MLPs, Backpropagation, Gradient Descent
        - CNNs: Convolution, Pooling, LeNet, AlexNet, ResNet, VGG
        - RNNs: LSTM, GRU, Sequence-to-Sequence, Attention Mechanism
        - Transformers: Self-attention, BERT, GPT, T5, Vision Transformers
        - Optimization: SGD, Adam, RMSprop, Learning Rate Scheduling
        - Regularization: Dropout, Batch Norm, Weight Decay, Early Stopping
        
        **🧩 GENERATIVE AI:**
        - **Gemini (Google)**: Multimodal AI (text, images, code, audio), best for reasoning and code
        - **ChatGPT (OpenAI)**: GPT-3.5/4, conversational AI, creative writing, analysis
        - **Midjourney**: AI image generation, artistic visuals, creative prompts
        - **DALL-E, Stable Diffusion**: Text-to-image, image editing, style transfer
        - **Claude (Anthropic)**: Constitutional AI, safety-focused, long conversations
        
        **🎯 PROMPT ENGINEERING:**
        - Zero-shot: Direct instruction without examples
        - Few-shot: Providing 2-5 examples for pattern learning
        - Chain-of-thought: Step-by-step reasoning prompts
        - System prompts: Role definition and behavior guidelines
        - Parameters: Temperature (creativity), Top-p (diversity), Max tokens
        
        **🔧 ML ALGORITHMS & TECHNIQUES:**
        - Ensemble Methods: Bagging, Boosting, XGBoost, LightGBM, CatBoost
        - Clustering: K-means, DBSCAN, Gaussian Mixture Models
        - Dimensionality Reduction: PCA, LDA, UMAP, Autoencoders
        - Time Series: ARIMA, LSTM, Prophet, Seasonal Decomposition
        - Computer Vision: Object Detection (YOLO, R-CNN), Segmentation, OCR
        - NLP: Tokenization, Word2Vec, BERT, Named Entity Recognition, Sentiment Analysis
        
        **⚡ ADVANCED TOPICS:**
        - MLOps: Model Deployment, Monitoring, CI/CD, Docker, Kubernetes
        - AutoML: Hyperparameter Tuning, Neural Architecture Search
        - Federated Learning: Distributed training, Privacy-preserving ML
        - Explainable AI: LIME, SHAP, Feature Importance, Model Interpretability
        - AI Ethics: Bias Detection, Fairness, Responsible AI, Privacy
        
        **📊 PRACTICAL TOOLS & FRAMEWORKS:**
        - Python: scikit-learn, pandas, numpy, matplotlib, seaborn
        - Deep Learning: TensorFlow, PyTorch, Keras, Hugging Face
        - Cloud: AWS SageMaker, Google AI Platform, Azure ML
        - Deployment: Flask, FastAPI, Streamlit, Docker, REST APIs
        
        Always provide detailed explanations, code examples, mathematical intuition, and practical applications.
        """
    
    def get_response(self, user_query):
        prompt = f"""
        {self.ai_knowledge_base}
        
        User Question: {user_query}
        
        Provide a comprehensive, detailed response covering all relevant AI/ML aspects. Include:
        - Technical explanations with mathematical intuition when applicable
        - Practical code examples and implementations
        - Real-world applications and use cases
        - Best practices and common pitfalls
        - Comparisons between different approaches
        
        For Generative AI topics, focus on model capabilities, prompt engineering techniques, and practical applications.
        For traditional ML, explain algorithms, when to use them, and implementation details.
        Always be thorough and educational.
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text.strip()
        except Exception as e:
            return f"Sorry, I encountered an error: {str(e)}"

chatbot = AIChatbot()

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    
    if not user_message:
        return jsonify({'error': 'No message provided'}), 400
    
    response = chatbot.get_response(user_message)
    return jsonify({'response': response})

@app.route('/topics', methods=['GET'])
def get_topics():
    topics = {
        'fundamentals': ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
        'deep_learning': ['Neural Networks', 'CNNs', 'RNNs', 'Transformers'],
        'generative_ai': ['Gemini', 'ChatGPT', 'Midjourney', 'Prompt Engineering'],
        'algorithms': ['Decision Trees', 'SVM', 'K-means', 'XGBoost'],
        'advanced': ['MLOps', 'AutoML', 'Explainable AI', 'AI Ethics']
    }
    return jsonify(topics)

@app.route('/prompt-tips', methods=['GET'])
def prompt_tips():
    tips = {
        'techniques': {
            'zero_shot': 'Direct instruction: "Translate to French: Hello"',
            'few_shot': 'With examples: "English→French: Hello→Bonjour, Goodbye→Au revoir, Thank you→?"',
            'chain_of_thought': 'Step-by-step: "Solve 15% of 240: Step 1: Convert to decimal..."'
        },
        'best_practices': [
            'Be specific and clear',
            'Provide context and examples',
            'Use structured formats',
            'Iterate and refine prompts'
        ],
        'model_strengths': {
            'gemini': 'Multimodal tasks, code generation, reasoning',
            'chatgpt': 'Conversations, creative writing, analysis',
            'midjourney': 'Artistic images, creative visuals'
        }
    }
    return jsonify(tips)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'healthy', 'topics_covered': 'All AI/ML from basics to advanced'})

if __name__ == '__main__':
    app.run(debug=True, port=5000)