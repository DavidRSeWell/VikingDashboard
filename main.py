#from webui import WebUI
from backend.api import app

#ui = WebUI(app, debug=True)


#@app.route('/')
#def index():
#    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run()