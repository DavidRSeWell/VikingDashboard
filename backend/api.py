"""
Module for connecting the vikingzero dashboard to the backend
"""
import numpy as np
import os
import torch

from flask import Flask, request
from torch.autograd import Variable

from .util import load_agent, load_all

app = Flask(__name__)

NAME = "AlphaGo"
GAME = "tictactoe"

CURR_DIR = os.path.abspath(os.getcwd())

AGENTS, ENV = load_all(CURR_DIR)

@app.route("/alpha_opinion", methods=["Post","Get"])
def alpha_opinion():

    print("Called Alpha Opinion")
    data = request.get_json()
    board = data["board"]
    board = json_to_board(board)
    env_name = data["env_name"]
    env = ENV[env_name]
    agent = AGENTS[env_name]["alphago"]
    action_size = env.action_size
    board = board.reshape((env.board.shape))

    print(board)

    board_t = agent.transform_state(board)

    print(board_t)

    board_var = Variable(torch.from_numpy(board_t).type(dtype=torch.float))

    p, v = agent._nn.predict(board_var)

    actions = env.valid_actions(board)

    p[[a for a in range(env.action_size) if a not in actions]] = 0

    p = p / p.sum()

    curr_board = board.copy()
    value_board = [0 for _ in range(action_size)]

    for a in actions:
        next_board = env.next_state(curr_board,a)
        next_board = agent.transform_state(next_board)
        board_var_a = Variable(torch.from_numpy(next_board).type(dtype=torch.float))
        p_a, v_a = agent._nn.predict(board_var_a)
        value_board[a] = np.round(float(-1.0*v_a),2)

    # Get prob distribution for move
    agent.reset()

    action , p_a = agent.act(board)


    print("Returjing from alpha optinion")
    print(p.tolist())
    print(value_board)
    print(p_a)

    return {"p":p.tolist(), "v": value_board, "mcts_p":p_a.tolist()}

@app.route("/is_win",methods=["Post","Get"])
def is_win():
    data = request.get_json()
    board = data["board"]
    env_name = data["env_name"].lower()
    env = ENV[env_name]
    board = json_to_board(board)
    board = board.reshape(env.board.shape)
    win = env.is_win(board)
    if win:
        print("Is WIN")
    return {"win":int(win)} ,201

@app.route("/make_move",methods=["Post","Get"])
def make_move():

    move_data = request.get_json()

    action = move_data["action"]

    board = json_to_board(move_data["board"])

    env_name = move_data["env_name"]

    player = move_data["player"]

    agent_type = move_data["agent"]

    agent = AGENTS[env_name][agent_type]

    env = ENV[env_name]

    if env_name == "connect4":
        board = board.reshape(env.board.shape)
        action = board_index_to_col(action)

    env.board = board

    next_board = env.next_state(board,action)
    if env.is_win(next_board):
        winner = env.check_winner(next_board)
        next_board = board_to_json(next_board.flatten())
        print("IS WIN Retuing win info")
        print(type(next_board))
        print(type(winner))
        return {"board": next_board, "winner":int(winner)}, 201

    if agent_type == "alphago":
        agent.reset()
        agent._act_max = True

    print("Make Move")
    print(board)
    print(next_board)
    print(agent_type)
    env.current_player = env.check_turn(next_board)
    env.board = next_board
    a = agent.act(next_board)
    if type(a) == tuple:
        a,p_a = a

    print("Action")
    print(a)
    print(type(env))
    curr_state, action, next_s, winner = env.step(a)

    next_board = board_to_json(next_s.flatten())

    return {"board": next_board, "winner":winner} , 201

@app.route("/new_game",methods=["Post"])
def new_game():

    move_data = request.get_json()

    GAME = move_data["game"].lower()

    ENV[GAME].reset()

    return {}, 201

@app.route("/get_next_state", methods=["Post","Get"])
def get_next_state():

    move_data = request.get_json()

    action = move_data["action"]

    board = json_to_board(move_data["board"])

    env_name = move_data["env_name"].lower()

    env = ENV[env_name]

    if env_name == "connect4":
        board = board.reshape(env.board.shape)
        action = board_index_to_col(action)

    env.board = board

    print("Get next state")
    print(board)

    next_board = env.next_state(board,action)

    print("Next board")
    board_to_json(next_board.flatten())

    return {"board": board_to_json(next_board.flatten()) }, 201


def board_to_json(board):

    board = board.tolist()

    for idx, item in enumerate(board):
        if item == 1:
            board[idx] = "X"
        elif item == 2:
            board[idx] = "O"
        elif item == 0:
            board[idx] = None

    return board


def board_index_to_col(action):
    a = np.zeros((42,))
    a[action] = 1
    b = a.reshape((6,7))
    action = int(np.where(b == 1)[1])
    return action


def json_to_board(board):

    board = list(board)

    for idx, item in enumerate(board):
        if item == "X":
            board[idx] = 1
        elif item == "O":
            board[idx] = 2
        elif item == None:
            board[idx] = 0

    return np.array(board)


def create_json_tree(agent,node):
    """
    From the current node create a json tree that we can
    pass back to front end
    :param node:
    :return:
    """

    children = agent.children[node]

    tree = {
        "name": "0",
        "children": [

        ]
    }

    keys = {
        node: 0
    }
    node_num = 0


