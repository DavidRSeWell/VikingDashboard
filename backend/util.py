import torch
import yaml

from vikingzero.agents.connect4_agent import Connect4MCTS, Connect4MinMax
from vikingzero.agents.tictactoe_agents import TicTacToeMCTS, TicTacToeMinMax
from vikingzero.agents.alphago import AlphaZero
from vikingzero.environments.tictactoe_env import TicTacToe
from vikingzero.environments.connect4_env import Connect4

global AGENTS

AGENTS = {
    "connect4":
        {
            "alphago": AlphaZero,
            "minimax": Connect4MinMax,
            "alphabeta": Connect4MinMax,
            "mcts": Connect4MCTS
        },
    "tictactoe":
        {
            "alphago":AlphaZero,
            "minimax": TicTacToeMinMax,
            "alphabeta": TicTacToeMinMax,
            "mcts": TicTacToeMCTS
        }
}


ENVS = {
    "tictactoe": TicTacToe(),
    "connect4": Connect4()
}

def load_all(dir):
    """
    Used at begining of app load
    :return:
    """
    global AGENTS
    agents = AGENTS.copy()

    for game, agents_dict in AGENTS.items():
        for agent_name,agent in agents_dict.items():
            env = ENVS[game]
            if agent_name == "alphago":
                agents[game][agent_name] = load_agent("alphago",game,dir)[0]
            elif agent_name == "mcts":
                agents[game][agent_name] = agent(env,player=2)
            else:
                agents[game][agent_name] = agent(env,player=2,type=agent_name)

    return AGENTS,ENVS


def load_agent(name,game,dir):

    print("Load agent")
    print(name)
    print(game)
    data = load_yaml(game,dir)

    env = ENVS[game]

    if name.lower() == "alphago":

        Agent = AlphaZero

        agent_config = data["agent_config"]

        agent1 = agent_config["agent1"]

        del agent1["agent"]

        agent = Agent(env, **agent1)

        agent_model_path = dir + f"/backend/models/{game}_model"

        agent._nn.load_state_dict(torch.load(agent_model_path))

        agent._act_max = False

    else:
        Agent = AGENTS[game][name]

        agent = Agent(env,player=2,type=name)


    return agent,env


def load_yaml(name,dir):

    config_file = dir

    if "tictactoe" in name:
        config_file += "/backend/models/tictactoe.yaml"

    elif "connect4" in name:
        config_file += "/backend/models/connect4.yaml"

    with open(config_file) as f:
        data = yaml.load(f, Loader=yaml.FullLoader)

        return data



