from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/', methods=['POST'])
def link():
    pass

if __name__ == '__main__':
    print('running server...')
    app.run(debug=True)
