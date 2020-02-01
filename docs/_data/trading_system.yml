trading_system: "A trading system is a hierarchy that contains definitions regarding any number of trading strategies, all sharing the same market, the same base asset, and the same initial capital."

parameters: "Parameters are user definitions over several concepts. When defined at the level of a session, parameters take precedence over those defined at the level of the trading system, which act as a fallback instance. The behavior of parameters may vary depending on the type of session."

base_asset: "In the context of a trading system or a session, the base asset is the asset in the pair on which capital stands when out of a trade."

quoted_asset: "In the context of a trading system or a session, the quoted asset is the asset in the pair for wich capital is traded."

time_frame: "The time frame is the frequency on which the session runs, meaning that the associated process instance runs once per unit of the time frame."

time_range: "The time range is the specific period of time between a starting and an ending date on which the session runs."

slippage: "The slippage is an assumption on the difference between the simulated rate and the actual fill rate of an order, most relevant in the context of backtesting and paper-trading sessions. The parameter is a tool to make simulations more realistic."

fee_structure: "The fee structure is a parameter enabling users to enter assumptions on fees, to be computed on backtesting and paper trading sessions to make simulations more realistic."

strategy: "A strategy is a set of actions occurring in stages, designed to achieve a specific goal within a broader plan, via executing trades."

trigger_stage: "The trigger stage deals with monitoring the market in search for trading oportunities with the corresponding strategy."

trigger-on_event: "The trigger-on event defines the set of rules that need to be met in order for the corresponding strategy to be triggered on. A strategy that is triggered on may use all the capital available to the trading system, preventing other strategies in the system from triggering."

situation: "A situation refers to a specific state of the market in which a certain event should take place, as defined by any number of conditions."

condition: "Conditions are rules within a situation. When all conditions under a situation validate true, then the situation gets validated as well, and the associated event is triggered."

trigger-off_event: "The trigger-off event defines the situation in which the corresponding strategy shall be triggered-off. A strategy that is triggered-off releases the capital in reserve and makes it available to other strategies in the trading system."

take_position_event: "The take position event defines the situation that needs to be met in order to enter a trade."

open_stage: "The open stage deals with all the parameters that define a trade, including position rate and size as well as initial stop and take profit targets."

initial_definition: "The initial definition node groups the parameters that define the trade at the moment the position is taken."

initial_stop: "The initial stop defines the initial target to stop a loss, before the trade gets to be managed."

phase_0: "Phase 0 represents the starting point for a stop or take profit target, which may be managed in subsequent phases, on the manage stage."

formula: "A formula is a mathematical expression intended to determine a numerical value to be applied dynamically to a certain property."

next_phase_event: "The next-phase event describes a market situation upon which the management of the trade should shift from one phase to the next."

initial_take_profit: "The initial take profit defines the initial target to take profit, before the trade gets to be managed."

position_size: "The size of the position is the amount of capital that will go in the trade, denominated in the quoted asset. The position size node allows setting a size for the position using a formula."

position_rate: "The position rate is the rate at which the position is taken, denominated in the quoted asset. The position rate node allows setting the desired position rate with a formula. However, the formula is overriden by the system as execution is currently limited to market orders until a more robust execution system is deployed. Therefore, the position rate is currently taken from the close value of the last candle."

open_execution: "Open execution is the node that will eventually hold the information regarding the execution of the trade opening orders."

manage_stage: "The manage stage is the third stage in the definition of a strategy and deals with the management of stop and take profit targets."

stop: "Stop sets a new stop loss target associated with the corresponding phase."

phase_1: "Phase 1 is the first phase in the management of a stop or take profit target. The management of targets may have as many phases as required."

take_profit: "Take profit sets a new take profit target associated with the corresponding phase."

close_stage: "Close stage is not developed yet. In the future, it will deal with the execution of the closing orders, trading log, and related matters."

close_execution: "Close execution is the node that will eventually hold the information regarding the execution of the trade closing orders."