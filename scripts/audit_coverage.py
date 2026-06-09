"""Audit reference card coverage against a comprehensive topic list."""
from __future__ import annotations
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
REFS = ROOT / "docs" / "references"

all_terms: set[str] = set()
for f in sorted(REFS.glob("*.json")):
    data = json.loads(f.read_text(encoding="utf-8"))
    for c in data.get("references", []):
        for t in c.get("terms", []) + c.get("aliases", []):
            all_terms.add(t.lower().strip())

# Every keyword a Python DA student might type
WANT = [
    # pandas core
    "dataframe", "series", "read_csv", "to_csv", "head", "tail", "info",
    "describe", "shape", "columns", "dtypes", "index", "loc", "iloc",
    "at", "iat", "groupby", "agg", "apply", "map", "applymap", "merge",
    "join", "concat", "sort_values", "sort_index", "drop", "drop_duplicates",
    "fillna", "dropna", "isnull", "notnull", "isna", "notna", "value_counts",
    "unique", "nunique", "reset_index", "set_index", "rename", "astype",
    "copy", "pivot_table", "pivot", "melt", "stack", "unstack", "crosstab",
    "cut", "qcut", "str accessor", "dt accessor", "to_excel", "read_excel",
    "to_json", "read_json", "pct_change", "diff", "shift", "rolling",
    "expanding", "ewm", "resample", "sample", "nlargest", "nsmallest",
    "where", "mask", "clip", "cumsum", "cumprod", "query", "eval", "pipe",
    "assign", "explode", "get_dummies", "factorize", "transpose",
    # numpy
    "numpy", "array", "ndarray", "zeros", "ones", "arange", "linspace",
    "reshape", "dot", "matmul", "argmin", "argmax", "concatenate",
    "vstack", "hstack", "flatten", "ravel", "random", "broadcast",
    "linalg", "vectorize",
    # matplotlib
    "scatter", "bar", "hist", "pie", "boxplot", "heatmap", "subplots",
    "figure", "axes", "legend", "xlabel", "ylabel", "title",
    "tight_layout", "savefig", "figsize",
    # seaborn
    "seaborn", "sns.heatmap", "sns.scatterplot", "sns.lineplot",
    "sns.barplot", "sns.boxplot", "sns.histplot", "sns.pairplot",
    "sns.catplot", "sns.regplot", "sns.countplot",
    # plotly
    "plotly", "plotly.express", "px.scatter", "px.bar", "px.line",
    "px.histogram", "px.box",
    # sklearn
    "sklearn", "train_test_split", "fit", "predict", "score",
    "accuracy_score", "linear regression", "logistic regression",
    "decision tree", "random forest", "cross_val_score",
    "cross validation", "gridsearchcv", "pipeline", "make_pipeline",
    "standardscaler", "minmaxscaler", "labelencoder", "onehotencoder",
    "confusion matrix", "classification report", "roc_auc_score",
    "mean_squared_error", "r2_score", "kmeans", "pca", "svm",
    # Python core
    "list", "dict", "tuple", "set", "frozenset",
    "for loop", "while loop", "try except", "with statement",
    "lambda", "*args", "**kwargs", "class", "__init__",
    "inheritance", "super", "property", "classmethod", "staticmethod",
    "generator", "yield", "iterator", "list comprehension",
    "dict comprehension", "decorator", "functools",
    "open", "json.load", "json.dump", "pickle", "csv",
    "os.path", "pathlib", "glob",
    "datetime", "timedelta", "strftime", "strptime",
    "regex", "re.match", "re.search", "re.findall", "re.sub",
    "zip", "enumerate", "sorted", "reversed",
    "isinstance", "hasattr", "getattr",
    "f-string", "isalpha", "isdigit", "isalnum",
    # statistics / scipy
    "statistics", "mean", "median", "mode",
    "scipy", "t-test", "chi-square", "anova", "pearson", "spearman",
    "correlation", "normal distribution",
    # database
    "sqlite3", "mysql", "pymysql", "mongodb", "pymongo",
    "sqlalchemy",
    # API / web
    "requests", "beautifulsoup", "flask", "fastapi",
    # time series
    "arima", "prophet", "statsmodels", "acf", "pacf", "adf test",
    "pmdarima", "auto_arima",
    # jupyter / tools
    "jupyter", "%timeit", "tqdm", "logging", "argparse",
]

missing = [w for w in WANT if w.lower() not in all_terms]
found = len(WANT) - len(missing)
print(f"Coverage: {found}/{len(WANT)} ({100*found//len(WANT)}%)")
print(f"\nMissing ({len(missing)}):")
for m in sorted(missing):
    print(f"  - {m}")
