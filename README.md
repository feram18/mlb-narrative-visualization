# Narrative Visualization of MLB Batting Performance
> University of Illinois Urbana-Champaign | CS 416 - Data Visualization

## Messaging
This narrative visualization's purpose is to offer a perceptive examination of Major League Baseball's (MLB) batting statistics ranging from 2015 to 2023. It intends to display the average 'batting average (AVG)' among qualified batters per year in the overview scene, let users dive down into certain years to see the correlation between players' swing percentage and batting AVG, and provide a more in-depth analysis of the performance of specific players.

## Narrative Structure
Users can switch between many scenes thanks to the interactive slide show format that the narrative visualization implemented in this project. The visualization opens with an overview scenario that uses a bar chart to show the average batting average by year, which highlights a consistent trend over the years. Users can then use a scatter plot to delve further into a particular year to examine batting statistics. Finally, they can choose a specific player to view the distribution of hit types as a bar chart for that player.

## Visual Structure
Each scene is created to make it easier to understand and navigate the data displayed. A bar chart in the overview scene effectively displays the average 'batting average' statistic over time. Users can dive down into specific years in the interactive slide show, where a scatter plot efficiently illustrates the connection between each player's swing percentage and batting average, a matching color helps indicate the user the year shown in the scatterplot. The scatterplot invites the user to think about whether a player's swing percentage can have an impact on their number of walks, home runs, or strikeouts. A back button is provided to switch between scenes, ensuring easy navigation across the display.

## Scenes
Three scenes make up the narrative visualization:
1. Overview Scene: Uses a bar chart to show the average "batting average (AVG)" by year.
2. Drill-Down Scene: This feature enables users to choose a specific year and observe a scatter plot depicting the correlation between swing percentage and batting average.
3. Individual Player Scene: Offers a bar chart showing the breakdown of hits types for a chosen player over the course of a particular year.

The scenes flow naturally from a high-level overview of batting statistics to more in-depth analyses of particular years and specific players.

## Annotations
The callout circle annotation template is used for the annotations, which are intentionally positioned to draw attention to the players who have the most home runs, strikeouts, and walks in the drill-down scene. These annotations serve to reinforce the idea by highlighting the players who led the season in those categories. As users examine the data, the annotations remain constant inside a scenario, giving them reliable visual clues.

## Parameters
The player and year that are chosen serve as the narrative visualization's parameters. These factors determine the visualization's state and have an impact on the information shown in each scene. Users can explore different years and players by changing the states, which dynamically updates the representations.

## Triggers
Changes in the narrative visualization's state are brought about by user actions. The drill-down scene for the chosen year is launched by clicking a bar in the overview scene. Users can examine the individual player scene in the drill-down scene by clicking on a data point representing a player, which displays the hits distribution for that player in the selected year. The back button gives users the option to go back to the previous scene.

## Affordances
The narrative visualization provides users with a number of affordances to help them. The sections that users can interact with are indicated by interactive features, such as the bars and data points, which react to mouse-over and click operations. Additionally, the back button improves navigation and user experience by graphically communicating that users can go back to the previous scene.
