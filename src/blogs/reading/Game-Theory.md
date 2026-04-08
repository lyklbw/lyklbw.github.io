# Game Theory
> UCSB ECE 270 Winter 2026
> 
> Supervised by Professor João P. Hespanha
>
> Ref: J. Hespanha. Noncooperative Game Theory: An Introduction for Engineers and Computer Scientists. Princeton Press, 2017. ISBN-13: 978-0691175218.

## Preamble

Game theory provides a framework for reasoning about problems in
which multiple “players” must make decisions, with the understanding that the results
of these decisions affect and are affected by the decisions of the other players.

 In other words, game theory thus provides a framework to
predict the behavior of rational players, either in board games or in economics.

It is not necessary to go far to find trouble:
equilibria do not always exist and sometimes there is more than one equilibrium. How
is one then supposed to predict the behavior of rational players? And what if a single
equilibrium exists, but we do not like the predicted behavior of the players? These
questions lead to some of the most interesting problems in game theory: “How to
design games that predictably lead to desirable actions by the players?”

In fact, game theory provides a basic mathematical framework for robust design in
engineering.

<u> The content of these courses </u>

* Lectures 1–2 introduce the basic elements of a mathematical game through a set of
simple examples.

    Player, game rules and objectives, information structure,
    player rationality, cooperative versus noncooperative solutions, and Nash equilibrium

* Lectures 3–8 are focused on zero-sum games.

    Saddle-point equilibrium and explore its key properties, both for pure and mixed policies; The Minimax Theoremand computational issues; information structure of a game information structure of a game; Complex information structures lead to the distinction between two types of stochastic policies: mixed and behavioral policies

* Non-zero sum games are treated in lectures 9–13

    Nash equilibrium in a general setting and discuss its numerical computation for two-player bimatrix games; class of potential games; on the design of potential games to solve distributed optimization problems.

* The last set of lectures 14–18 is devoted to the solution of dynamic games
    
    Dynamic Programming; construct saddle-point policies for zero-sum games;
    discrete- and continuous-time games, with a fixed or a variable termination time.

## Lecture 1: Introduction to Game Theory

1. Elements of a game
    * The players (who makes decision)
    * The rules (actions)
    * The information structure (full-information game & partial-information game)
    * The objectives (player's goal)
    * One antoher needs to emphasize is the rationality of players.
    * non-cooperative game
  
2. Zero-sum games and non-zero-sum games
    * Zero-sum games: the gain of one player is the loss of another player.
    * Non-zero-sum games: the gain of one player is not necessarily the loss of another player.
  

