"""
Spotify Songs — нтерактивный дашборд
Запуск: python Spotify_Dashboard_RU_2026.py
Адрес:  http://127.0.0.1:8054
"""

import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots

import dash
from dash import dcc, html, Input, Output, callback
import dash_bootstrap_components as dbc

# в”Ђв”Ђ Р”Р°РЅРЅС‹Рµ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
df = pd.read_csv("data/spotify_songs.csv")
df["year"] = pd.to_datetime(df["track_album_release_date"], errors="coerce").dt.year
df["duration_min"] = df["duration_ms"] / 60_000
df["party_index"] = (df["danceability"] + df["energy"] + df["valence"]) / 3

AUDIO_FEATURES = [
    "danceability", "energy", "loudness", "speechiness",
    "acousticness", "instrumentalness", "liveness", "valence", "tempo",
]
AUDIO_RU = {
    "danceability": "Танцевальность",
    "energy": "Энергия",
    "loudness": "Громкость (дБ)",
    "speechiness": "Речевитость",
    "acousticness": "Акустичность",
    "instrumentalness": "нструментальность",
    "liveness": "Живость",
    "valence": "Настроение",
    "tempo": "Темп (BPM)",
}
GENRE_RU = {
    "edm": "EDM",
    "latin": "Латин",
    "pop": "Поп",
    "r&b": "R&B",
    "rap": "Рэп",
    "rock": "Рок",
}
GENRE_ORDER = ["edm", "latin", "pop", "r&b", "rap", "rock"]
PALETTE = {
    "edm": "#1DB954", "latin": "#FF6B6B", "pop": "#4ECDC4",
    "r&b": "#9B59B6", "rap": "#F39C12", "rock": "#E74C3C",
}
COLOR_SEQ = [PALETTE[g] for g in GENRE_ORDER]

LAYOUT = dict(
    template="plotly_dark",
    paper_bgcolor="#191414",
    plot_bgcolor="#191414",
    font=dict(family="Arial", size=13, color="#FFFFFF"),
    margin=dict(t=55, b=40, l=55, r=30),
)


# в”Ђв”Ђ KPI-РєР°СЂС‚РѕС‡РєР° в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
def kpi_card(title, value, icon, color):
    return dbc.Card([
        dbc.CardBody([
            html.Div(icon, style={"fontSize": "28px"}),
            html.H4(value, style={"color": color, "margin": "4px 0", "fontWeight": "bold"}),
            html.P(title, style={"color": "#aaa", "fontSize": "13px", "margin": 0}),
        ], style={"textAlign": "center", "padding": "16px 8px"}),
    ], style={"backgroundColor": "#232323", "border": f"1px solid {color}44", "borderRadius": "12px"})


# в”Ђв”Ђ РџСЂРёР»РѕР¶РµРЅРёРµ в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
app = dash.Dash(
    __name__,
    external_stylesheets=[dbc.themes.CYBORG],
    title="Spotify Дашборд",
)

app.layout = dbc.Container([

    # Заголовок
    dbc.Row([
        dbc.Col([
            html.H1("🎵 Spotify Songs — Аналитический дашборд",
                    style={"color": "#1DB954", "fontWeight": "bold", "marginTop": "20px"}),
            html.P("32 833 трека · 6 жанров · аудио-фичи Spotify API",
                   style={"color": "#aaa", "marginBottom": "20px"}),
        ])
    ]),

    # KPI-карточки
    dbc.Row([
        dbc.Col(kpi_card("Всего треков", f"{df.shape[0]:,}", "🎵", "#1DB954"), md=2),
        dbc.Col(kpi_card("Артистов", f"{df['track_artist'].nunique():,}", "🎤", "#4ECDC4"), md=2),
        dbc.Col(kpi_card("Альбомов", f"{df['track_album_name'].nunique():,}", "💿", "#9B59B6"), md=2),
        dbc.Col(kpi_card("Ср. популярность", f"{df['track_popularity'].mean():.1f}/100", "⭐", "#F39C12"), md=2),
        dbc.Col(kpi_card("Ср. длина (мин)", f"{df['duration_min'].mean():.2f}", "⏱️", "#FF6B6B"), md=2),
        dbc.Col(kpi_card("Годы", f"{int(df['year'].min())}–{int(df['year'].max())}", "📅", "#E74C3C"), md=2),
    ], className="mb-4 g-2"),

    html.Hr(style={"borderColor": "#333"}),

    # Фильтры
    dbc.Row([
        dbc.Col([
            html.Label("🎸 Жанры:", style={"color": "#1DB954", "fontWeight": "bold"}),
            dcc.Dropdown(
                id="genre-filter",
                options=[{"label": GENRE_RU[g], "value": g} for g in GENRE_ORDER],
                value=GENRE_ORDER,
                multi=True,
                placeholder="Выберите жанры...",
            ),
        ], md=4),
        dbc.Col([
            html.Label("📅 Диапазон лет:", style={"color": "#1DB954", "fontWeight": "bold"}),
            dcc.RangeSlider(
                id="year-slider",
                min=2000, max=2020, step=1,
                value=[2000, 2020],
                marks={y: str(y) for y in range(2000, 2021, 5)},
                tooltip={"placement": "bottom", "always_visible": False},
            ),
        ], md=4),
        dbc.Col([
            html.Label("⭐ Мин. популярность:", style={"color": "#1DB954", "fontWeight": "bold"}),
            dcc.Slider(
                id="popularity-slider",
                min=0, max=100, step=5, value=0,
                marks={0: "0", 25: "25", 50: "50", 75: "75", 100: "100"},
                tooltip={"placement": "bottom", "always_visible": True},
            ),
        ], md=4),
    ], className="mb-3"),

    html.Hr(style={"borderColor": "#333"}),

    # Вкладки
    dbc.Tabs([

        # Вкладка 1: Жанры
        dbc.Tab(label="🎭 Жанры", tab_id="tab-genres", children=[
            dbc.Row([
                dbc.Col(dcc.Graph(id="genre-pie"), md=5),
                dbc.Col(dcc.Graph(id="genre-radar"), md=7),
            ], className="mt-3"),
        ]),

        # Вкладка 2: Популярность
        dbc.Tab(label="⭐ Популярность", tab_id="tab-popularity", children=[
            dbc.Row([
                dbc.Col([
                    html.Label("Тип графика:", style={"color": "#aaa", "marginTop": "16px"}),
                    dbc.RadioItems(
                        id="pop-chart-type",
                        options=[
                            {"label": " Скрипичный", "value": "violin"},
                            {"label": " Ящик с усами", "value": "box"},
                            {"label": " Гистограмма", "value": "histogram"},
                        ],
                        value="violin",
                        inline=True,
                        inputStyle={"marginRight": "5px"},
                        labelStyle={"marginRight": "20px", "color": "#ccc"},
                    ),
                ], md=12),
            ], className="mt-2"),
            dbc.Row([
                dbc.Col(dcc.Graph(id="popularity-dist"), md=6),
                dbc.Col(dcc.Graph(id="top-artists"), md=6),
            ]),
        ]),

        # Вкладка 3: Карта настроений
        dbc.Tab(label=" Карта настроений", tab_id="tab-mood", children=[
            dbc.Row([
                dbc.Col([
                    html.Label("Ось X:", style={"color": "#aaa"}),
                    dcc.Dropdown(
                        id="mood-x",
                        options=[{"label": AUDIO_RU[f], "value": f} for f in AUDIO_FEATURES],
                        value="valence", clearable=False,
                    ),
                ], md=3),
                dbc.Col([
                    html.Label("Ось Y:", style={"color": "#aaa"}),
                    dcc.Dropdown(
                        id="mood-y",
                        options=[{"label": AUDIO_RU[f], "value": f} for f in AUDIO_FEATURES],
                        value="energy", clearable=False,
                    ),
                ], md=3),
                dbc.Col([
                    html.Label("Размер точек:", style={"color": "#aaa"}),
                    dcc.Dropdown(
                        id="mood-size",
                        options=[
                            {"label": "Популярность", "value": "track_popularity"},
                            {"label": "Темп (BPM)", "value": "tempo"},
                            {"label": "Одинаковый", "value": "none"},
                        ],
                        value="track_popularity", clearable=False,
                    ),
                ], md=3),
                dbc.Col([
                    html.Label("Кол-во точек:", style={"color": "#aaa"}),
                    dcc.Slider(id="mood-sample", min=500, max=5000, step=500,
                               value=2000, marks={500: "500", 2000: "2k", 5000: "5k"},
                               tooltip={"always_visible": False}),
                ], md=3),
            ], className="mt-3 mb-2"),
            dbc.Row([dbc.Col(dcc.Graph(id="mood-scatter"), md=12)]),
        ]),

        # Вкладка 4: Тренды
        dbc.Tab(label="📈 Тренды", tab_id="tab-trends", children=[
            dbc.Row([
                dbc.Col([
                    html.Label("Показатели для отображения:", style={"color": "#aaa", "marginTop": "16px"}),
                    dcc.Checklist(
                        id="trend-features",
                        options=[{"label": f"  {AUDIO_RU[f]}", "value": f}
                                 for f in ["danceability", "energy", "valence", "acousticness", "speechiness"]],
                        value=["danceability", "energy", "valence", "acousticness"],
                        inline=True,
                        inputStyle={"marginRight": "4px"},
                        labelStyle={"marginRight": "16px", "color": "#ccc"},
                    ),
                ], md=12),
            ], className="mt-2"),
            dbc.Row([dbc.Col(dcc.Graph(id="trends-chart"), md=12)]),
        ]),

        # Вкладка 5: Корреляции
        dbc.Tab(label="🔥 Корреляции", tab_id="tab-corr", children=[
            dbc.Row([
                dbc.Col(dcc.Graph(id="corr-heatmap"), md=7),
                dbc.Col(dcc.Graph(id="party-index"), md=5),
            ], className="mt-3"),
        ]),

        # Вкладка 6: Топ треки
        dbc.Tab(label="🏆 Топ треки", tab_id="tab-top", children=[
            dbc.Row([
                dbc.Col([
                    html.Label("Количество треков:", style={"color": "#aaa", "marginTop": "16px"}),
                    dcc.Slider(id="top-n", min=5, max=30, step=5, value=10,
                               marks={5: "5", 10: "10", 20: "20", 30: "30"},
                               tooltip={"always_visible": True}),
                ], md=4),
                dbc.Col([
                    html.Label("Метрика:", style={"color": "#aaa", "marginTop": "16px"}),
                    dbc.RadioItems(
                        id="top-metric",
                        options=[
                            {"label": " Популярность", "value": "track_popularity"},
                            {"label": " Танцевальность", "value": "danceability"},
                            {"label": " Энергия", "value": "energy"},
                            {"label": " Настроение", "value": "valence"},
                        ],
                        value="track_popularity",
                        inline=True,
                        inputStyle={"marginRight": "5px"},
                        labelStyle={"marginRight": "16px", "color": "#ccc"},
                    ),
                ], md=8),
            ], className="mt-2"),
            dbc.Row([dbc.Col(dcc.Graph(id="top-tracks-chart"), md=12)]),
        ]),

    ], id="tabs", active_tab="tab-genres",
       style={"borderBottom": "2px solid #1DB954"}),

    html.Footer(
        "Spotify Songs EDA | Python for Data Analytics 2026",
        style={"color": "#555", "textAlign": "center", "marginTop": "30px", "marginBottom": "10px"},
    ),

], fluid=True, style={"backgroundColor": "#121212", "minHeight": "100vh", "padding": "0 20px"})


# в”Ђв”Ђ РҐРµР»РїРµСЂ С„РёР»СЊС‚СЂР°С†РёРё в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
def filter_df(genres, years, min_pop):
    mask = (
        df["playlist_genre"].isin(genres) &
        df["year"].between(years[0], years[1]) &
        (df["track_popularity"] >= min_pop)
    )
    return df[mask]


# в”Ђв”Ђ Callbacks в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ

@callback(Output("genre-pie", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"), Input("popularity-slider", "value"))
def update_pie(genres, years, min_pop):
    d = filter_df(genres, years, min_pop)
    counts = d["playlist_genre"].value_counts().reset_index()
    counts.columns = ["genre", "count"]
    counts["label"] = counts["genre"].map(GENRE_RU)
    fig = go.Figure(go.Pie(
        labels=counts["label"], values=counts["count"], hole=0.55,
        marker_colors=[PALETTE.get(g, "#888") for g in counts["genre"]],
        textinfo="label+percent", textfont_size=12,
    ))
    fig.update_layout(title="Распределение по жанрам", showlegend=False, height=380, **LAYOUT)
    return fig


@callback(Output("genre-radar", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"), Input("popularity-slider", "value"))
def update_radar(genres, years, min_pop):
    d = filter_df(genres, years, min_pop).copy()
    d["loudness_norm"] = (d["loudness"] - d["loudness"].min()) / (d["loudness"].max() - d["loudness"].min())
    RF = ["danceability", "energy", "loudness_norm", "speechiness", "acousticness", "valence", "liveness"]
    RL = ["Танцевальность", "Энергия", "Громкость", "Речевитость", "Акустичность", "Настроение", "Живость"]
    means = d.groupby("playlist_genre")[RF].mean()
    fig = go.Figure()
    for g in genres:
        if g not in means.index:
            continue
        vals = means.loc[g].tolist()
        fig.add_trace(go.Scatterpolar(
            r=vals + vals[:1], theta=RL + RL[:1],
            fill="toself", fillcolor=PALETTE[g],
            line=dict(color=PALETTE[g], width=2), opacity=0.45, name=GENRE_RU[g],
        ))
    fig.update_layout(
        title="Аудио ДНК жанров",
        polar=dict(bgcolor="#242424",
                   radialaxis=dict(visible=True, range=[0, 1], gridcolor="#444"),
                   angularaxis=dict(gridcolor="#444")),
        legend=dict(orientation="h", y=-0.15), height=380, **LAYOUT,
    )
    return fig


@callback(Output("popularity-dist", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"),
          Input("popularity-slider", "value"), Input("pop-chart-type", "value"))
def update_pop_dist(genres, years, min_pop, chart_type):
    d = filter_df(genres, years, min_pop)
    fig = go.Figure()
    for g in genres:
        sub = d[d["playlist_genre"] == g]["track_popularity"]
        if chart_type == "violin":
            fig.add_trace(go.Violin(y=sub, name=GENRE_RU[g], box_visible=True, meanline_visible=True,
                                    fillcolor=PALETTE[g], line_color=PALETTE[g], opacity=0.8))
        elif chart_type == "box":
            fig.add_trace(go.Box(y=sub, name=GENRE_RU[g], marker_color=PALETTE[g]))
        else:
            fig.add_trace(go.Histogram(x=sub, name=GENRE_RU[g], marker_color=PALETTE[g], opacity=0.6, nbinsx=20))
    fig.update_layout(title="Популярность по жанрам", barmode="overlay", height=420, **LAYOUT)
    return fig


@callback(Output("top-artists", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"), Input("popularity-slider", "value"))
def update_top_artists(genres, years, min_pop):
    d = filter_df(genres, years, min_pop)
    top = (d.groupby("track_artist")
           .agg(avg_pop=("track_popularity", "mean"), count=("track_id", "count"))
           .query("count >= 5").sort_values("avg_pop", ascending=True).tail(15).reset_index())
    fig = go.Figure(go.Bar(
        x=top["avg_pop"], y=top["track_artist"], orientation="h",
        marker=dict(color=top["avg_pop"], colorscale="Viridis", showscale=False),
        text=top["avg_pop"].round(1), textposition="outside",
    ))
    fig.update_layout(title="Топ-15 артистов по популярности",
                      xaxis=dict(range=[top["avg_pop"].min() - 3, 103]), height=420, **LAYOUT)
    return fig


@callback(Output("mood-scatter", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"), Input("popularity-slider", "value"),
          Input("mood-x", "value"), Input("mood-y", "value"),
          Input("mood-size", "value"), Input("mood-sample", "value"))
def update_mood(genres, years, min_pop, xf, yf, size_feat, n_sample):
    d = filter_df(genres, years, min_pop)
    if len(d) > n_sample:
        d = d.sample(n_sample, random_state=42)
    kw = dict(x=xf, y=yf, color="playlist_genre", color_discrete_map=PALETTE, opacity=0.65,
              labels={xf: AUDIO_RU.get(xf, xf), yf: AUDIO_RU.get(yf, yf), "playlist_genre": "Жанр"},
              title=f"Карта настроений: {AUDIO_RU.get(xf)} vs {AUDIO_RU.get(yf)}",
              hover_data={"track_name": True, "track_artist": True},
              category_orders={"playlist_genre": genres})
    if size_feat != "none":
        kw["size"] = size_feat
        kw["size_max"] = 14
    fig = px.scatter(d, **kw)
    fig.add_hline(y=d[yf].mean(), line_dash="dot", line_color="#555")
    fig.add_vline(x=d[xf].mean(), line_dash="dot", line_color="#555")
    fig.update_layout(height=550, legend_title_text="Жанр", **LAYOUT)
    return fig


@callback(Output("trends-chart", "figure"),
          Input("genre-filter", "value"), Input("trend-features", "value"))
def update_trends(genres, features):
    d = df[df["playlist_genre"].isin(genres) & df["year"].between(2000, 2020)]
    features = features or ["danceability"]
    agg = {f: (f, "mean") for f in features}
    agg["track_count"] = ("track_id", "count")
    year_df = d.groupby("year").agg(**agg).reset_index()
    COLORS_T = ["#1DB954", "#FF6B6B", "#4ECDC4", "#9B59B6", "#F39C12"]
    fig = make_subplots(rows=2, cols=1,
                        subplot_titles=["Аудио-характеристики (2000–2020)", "Количество треков по годам"],
                        vertical_spacing=0.12, shared_xaxes=True)
    for i, feat in enumerate(features):
        if feat in year_df.columns:
            fig.add_trace(go.Scatter(x=year_df["year"], y=year_df[feat], mode="lines+markers",
                                     name=AUDIO_RU.get(feat, feat),
                                     line=dict(color=COLORS_T[i % len(COLORS_T)], width=2),
                                     marker=dict(size=5)), row=1, col=1)
    fig.add_trace(go.Bar(x=year_df["year"], y=year_df["track_count"],
                         name="Треков", marker_color="#F39C12", opacity=0.7), row=2, col=1)
    fig.update_layout(height=560, legend=dict(orientation="h", y=1.08), **LAYOUT)
    fig.update_yaxes(title_text="Значение (0–1)", row=1, col=1)
    fig.update_yaxes(title_text="Количество", row=2, col=1)
    return fig


@callback(Output("corr-heatmap", "figure"),
          Input("genre-filter", "value"), Input("popularity-slider", "value"))
def update_corr(genres, min_pop):
    d = df[df["playlist_genre"].isin(genres) & (df["track_popularity"] >= min_pop)]
    corr = d[AUDIO_FEATURES].corr().round(2)
    labels = [AUDIO_RU[f] for f in AUDIO_FEATURES]
    fig = px.imshow(corr, x=labels, y=labels, text_auto=True,
                    color_continuous_scale="RdBu_r", zmin=-1, zmax=1,
                    aspect="auto", title="Корреляционная матрица аудио-фичей")
    fig.update_layout(height=520, **LAYOUT)
    fig.update_traces(textfont_size=10)
    return fig


@callback(Output("party-index", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"), Input("popularity-slider", "value"))
def update_party(genres, years, min_pop):
    d = filter_df(genres, years, min_pop)
    party = (d.groupby("playlist_genre")["party_index"]
             .agg(["mean", "std"])
             .loc[[g for g in GENRE_ORDER if g in genres]]
             .reset_index().sort_values("mean", ascending=True))
    fig = go.Figure(go.Bar(
        x=party["mean"], y=party["playlist_genre"].map(GENRE_RU), orientation="h",
        marker=dict(color=party["mean"],
                    colorscale=[[0, "#2C3E50"], [0.4, "#F39C12"], [1.0, "#1DB954"]],
                    showscale=True, colorbar=dict(title="ндекс", tickformat=".2f")),
        error_x=dict(type="data", array=party["std"], visible=True, color="#aaa"),
        text=party["mean"].apply(lambda x: f"{x:.3f}"), textposition="outside",
    ))
    fig.add_vline(x=party["mean"].mean(), line_dash="dash", line_color="white", opacity=0.4,
                  annotation_text="Среднее", annotation_position="top")
    fig.update_layout(title="ндекс вечеринки",
                      xaxis=dict(title="(Танцевальность + Энергия + Настроение) / 3"),
                      height=520, **LAYOUT)
    return fig


@callback(Output("top-tracks-chart", "figure"),
          Input("genre-filter", "value"), Input("year-slider", "value"),
          Input("popularity-slider", "value"), Input("top-n", "value"), Input("top-metric", "value"))
def update_top_tracks(genres, years, min_pop, top_n, metric):
    d = filter_df(genres, years, min_pop)
    top = (d.groupby(["track_name", "track_artist", "playlist_genre"])[metric]
           .mean().reset_index()
           .sort_values(metric, ascending=False)
           .drop_duplicates("track_name").head(top_n)
           .sort_values(metric, ascending=True))
    top["label"] = top["track_name"].str[:40] + "  вЂ”  " + top["track_artist"].str[:18]
    fig = go.Figure(go.Bar(
        x=top[metric], y=top["label"], orientation="h",
        marker=dict(color=[PALETTE.get(g, "#888") for g in top["playlist_genre"]], opacity=0.85),
        text=top[metric].round(2), textposition="outside",
    ))
    fig.update_layout(title=f"Топ-{top_n} треков: {AUDIO_RU.get(metric, metric)}",
                      height=max(400, top_n * 30 + 100), **LAYOUT)
    return fig


# в”Ђв”Ђ Р—Р°РїСѓСЃРє в”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђв”Ђ
if __name__ == "__main__":
    print("\n" + "=" * 55)
    print("  Spotify Дашборд запущен!")
    print("  Открой в браузере: http://127.0.0.1:8054")
    print("=" * 55 + "\n")
    app.run(debug=True, port=8054)

