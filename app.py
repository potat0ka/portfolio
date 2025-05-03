from flask import Flask, render_template
import json
import os

app = Flask(__name__)

# File to store portfolio data
DATA_FILE = 'portfolio.json'

# Load portfolio data from file
def load_portfolio():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {
        'name': 'Bigendra Shrestha',
        'title': 'Web Developer & Data Science Enthusiast',
        'avatar': 'https://i.postimg.cc/JzBWVhW4/my-avatar.png',
        'about': [
            'I\'m Bigendra Shrestha, a passionate web developer and data science enthusiast currently pursuing my BCA at Saraswati Multiple Campus. I specialize in building modern, user-friendly websites using technologies like Python, Flask, HTML, and CSS.',
            'Through my internship at Nobel Navigators, I\'ve honed my skills in Python programming and data science, working on real-world projects that make an impact. I\'m always eager to learn new technologies and collaborate on innovative solutions, particularly in web development and AI-driven applications.'
        ],
        'services': [
            {'title': 'Web Design', 'description': 'Creating modern, responsive designs with a focus on user experience.', 'icon': 'https://i.postimg.cc/4389jZkP/icon-design.png'},
            {'title': 'Web Development', 'description': 'Building dynamic websites using Python, Flask, and JavaScript.', 'icon': 'https://i.postimg.cc/ZqgqrqzG/icon-dev.png'},
            {'title': 'Data Science', 'description': 'Analyzing data and building predictive models with Python and machine learning.', 'icon': 'https://i.postimg.cc/xjLdzYxZ/icon-app.png'}
        ],
        'projects': [
            {'title': 'MysticQuest', 'category': 'web development', 'image': 'https://i.postimg.cc/qRHpHMyd/project-1.jpg', 'link': 'https://replit.com/@bigestha88/MysticQuest'},
            {'title': 'Phishing Detection Tool', 'category': 'data science', 'image': 'https://i.postimg.cc/bNrcM2Wt/project-2.png', 'link': '#'}
        ],
        'contact': {
            'email': 'bigendra.shrestha@example.com',
            'phone': '+977 (986) 029-7032',
            'birthday': '1995-10-18',
            'location': 'Mhepi Janamargha-16, Kathmandu, Nepal',
            'linkedin': 'https://www.linkedin.com/in/bigendra-shrestha',
            'github': 'https://github.com/bigestha88'
        },
        'resume': {
            'education': [
                {'institution': 'Saraswati Multiple Campus', 'period': '2020 - 2025', 'description': 'Pursuing a Bachelor\'s in Computer Applications (BCA), learning programming fundamentals, web development, databases, and software engineering.'}
            ],
            'experience': [
                {'role': 'Intern, Nobel Navigators', 'period': '2024 - Present', 'description': 'Developed web applications and data analysis tools using Python and Flask, collaborating on real-world projects to enhance technical and leadership skills.'}
            ],
            'skills': [
                {'name': 'Python', 'percentage': 75},
                {'name': 'Web Development', 'percentage': 70},
                {'name': 'Data Science', 'percentage': 60},
                {'name': 'Flask', 'percentage': 65}
            ]
        },
        'testimonials': [
            {
                'title': 'Project Mentor',
                'avatar': 'https://i.postimg.cc/zGDHfn3G/avatar-1.png',
                'text': 'Bigendra\'s dedication during his internship at Nobel Navigators was impressive. His ability to quickly learn Python and apply it to real-world projects was remarkable.',
                'date': '2025-01-15'
            },
            {
                'title': 'Team Lead',
                'avatar': 'https://i.postimg.cc/DwY0yHtx/avatar-2.png',
                'text': 'Working with Bigendra on web development projects was a pleasure. His attention to detail and enthusiasm for learning new technologies stood out.',
                'date': '2025-01-15'
            }
        ],
        'clients': [
            {'name': 'Nobel Navigators', 'logo': 'https://i.postimg.cc/YqfKyG66/logo-1-color.png'}
        ],
        'blog_posts': [
            {
                'title': 'My Journey Learning Python',
                'category': 'Programming',
                'date': '2025-02-15',
                'image': 'https://i.postimg.cc/DysCZrWs/blog-1.jpg',
                'text': 'Sharing my experience learning Python through Nobel Navigators\' courses and YouTube, with tips for beginners.'
            }
        ]
    }

@app.route('/')
def index():
    portfolio = load_portfolio()
    return render_template('index.html', portfolio=portfolio)

@app.route('/about')
def about():
    portfolio = load_portfolio()
    return render_template('about.html', portfolio=portfolio)

@app.route('/contact')
def contact():
    portfolio = load_portfolio()
    return render_template('contact.html', portfolio=portfolio)

if __name__ == '__main__':
    app.run(debug=True)