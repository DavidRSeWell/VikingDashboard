# VikingDashboard
This repository is for a dashboard that allows you to play various games vs an AlphaGoZero bot. Currently there is only tic-tac-toe and Connect4 available. This is the front end to https://github.com/befeltingu/VikingZero. It uses flask for backend and React for front end. It is not highly polished but it works. 

### Install

Python requirements

```
git clone https://github.com/befeltingu/VikingDashboard
cd VikingDashboard
pip install -r requirements.txt
```

Front End

```
npm install
```

### RUN

Start backend

```
flask run
```

Start Front end

```
npm start
```

### Play

In browser you should see an image like the one below. From the top toolbar you can select the game (tictactoe / connect4) and whether you want to play as player 1 or 2. If you are playing as player 2 and hit the "New Game" button then the agent should play first as player 1. The three outputs "Alpha Probs", "MCTS Probs", and "Alpha Values" are all outputs from the agent. Alpha Probs is the output from the policy network given the current board. Alpha Values is the same but from the value network. MCTS Probs is the probability over possible action from the tree search. 

![Alt text](public/front_end_example.png?raw=true)


