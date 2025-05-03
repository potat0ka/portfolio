
from flask import Flask, request, render_template_string

app = Flask(__name__)

# HTML template with a form
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html>
<body>
    <form method="POST">
        <input type="text" name="message" placeholder="Enter your message">
        <button type="submit">Send</button>
    </form>
    {% if message %}
        <h2>Your message: {{ message }}</h2>
    {% endif %}
</body>
</html>
'''

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'POST':
        message = request.form.get('message', '')
        return render_template_string(HTML_TEMPLATE, message=message)
    return render_template_string(HTML_TEMPLATE, message=None)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
