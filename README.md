# AI Budget Tracker

I can't be bothered with readmes for now so yeah. 

I have also not tested anything in llm_caller so it probably has tons of bugs. 

backend structure - tentative

```
backend/
├── app/                         
│   ├── main.py                  # Creates FastAPI app, registers routes - basically very important
│   ├── config.py                # Loads environment variables
│   ├── database.py              # Database setup
│   │
│   ├── models/                  # Database table structures - classes
│   │
│   ├── schemas/                 # Pydantic models, data schemas going into api calls - also classes
│   │
│   ├── api/                     # endpoints for basic functions like login/user input/etc etc
│   │
│   ├── ai-services/             # AI logic endpoints
│   │
│   └── utils/                   # Helper functions
│
├── .env                         # SECRET - environment variables (git-ignored)
├── .gitignore                   
└── budget_tracker.db            # SQLite database file (created automatically)
```