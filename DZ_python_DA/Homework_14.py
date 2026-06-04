# Dash: Основной класс Dash, который вы используете для создания приложения.
# html: Позволяет использовать HTML-теги в среде Python.
# dcc: Основные компоненты Dash, которые включают интерактивные элементы, такие как графики, выпадающие окна и т. д.
# plotly.express: Используется для создания рисунков, которые будут отображаться в компонентах Dash.

from dash import Dash, html, dcc, Input, Output, callback
import plotly.express as px
import pandas as pd

# Эта строка инициализирует новое приложение Dash с __name__, указывающим на имя текущего модуля Python.
app = Dash(__name__)


# Загрузите данные из встроенного в plotly датасета gapminder
# Назовите датафрейм df_gapminder
df_gapminder = px.data.gapminder()

# HTML часть
# Заголовок первого уровня
header = html.Header(html.H1('My Dashboard'))

# Основной контент
main_content = html.Section([
    html.Article([
        # Добавьте заголовок третьего уровня с текстом "Гистограмма"
        html.H3('My Dashboard'),
        # Добавьте объект Dropdown для выбора континента
        # id = 'dropdown_histogram'
        # Значение по умолчанию - Asia
        # ['Asia' 'Europe' 'Africa' 'Americas' 'Oceania']
        dcc.Dropdown(
            id = 'continent_dropdown',
            options = [{'label': 'Asia', 'value': 'Asia'},
                       {'label': 'Europe', 'value': 'Europe'},
                       {'label': 'Africa', 'value': 'Africa'},
                       {'label': 'Americas', 'value': 'Americas'},
                       {'label': 'Oceania', 'value': 'Oceania'}
                       ],
            value = 'Asia'
        ),
        # Добавьте объект Graph c id dropdown_histogram_graph
        dcc.Graph(id = 'life-exp-histogram')
    ])
])

# Нижний колонтитул
footer = html.Footer([
    html.P('Copyright (c) 2024 My Dashboard'),
    html.P('Больше информации здесь')
])

# Соберите все составляющие страницы: заголовок, основную часть и колонтитул
app.layout = html.Div([ 
    header,
    main_content,
    footer
])

# Создайте @callback для обновления гистограммы в зависимости от выбранного компонента
@callback(
            Output(component_id='life-exp-histogram', component_property='figure'),
            Input(component_id='continent_dropdown', component_property='value')
)

# Создайте функцию, которая перерисовывает график, в зависимости от выбранного значения в dropdown
def update_graph(dropdown_value):
    filtered_df = df_gapminder[df_gapminder['continent'] == dropdown_value]
    fig = px.histogram(filtered_df, x = 'lifeExp', nbins = 30)
    return fig

# app.run(): Запускает сервер Flask и обслуживает ваше приложение Dash. 
# Параметр debug=True позволяет автоматически перезагружать приложение во время разработки при внесении изменений в код.
if __name__ == '__main__':
    app.run(debug = True)