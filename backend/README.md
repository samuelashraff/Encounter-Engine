## Setup

Run

```bash
cd backend
python -m venv venv
```
Then, on Linux:

```bash
source venv/bin/activate
```

Or on Windows:

```bash
venv\Scripts\activate
```

And finally:

```bash
pip install -r requirements.txt
uvicorn main:socket_app --reload
```

To leave the virtual environment:

```bash
deactivate
```