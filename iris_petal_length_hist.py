import matplotlib.pyplot as plt
import seaborn as sns


iris = sns.load_dataset("iris")

plt.figure(figsize=(8, 6))

plt.hist(
    iris[iris["species"] == "setosa"]["petal_length"],
    bins=30,
    alpha=0.5,
    label="setosa",
)
plt.hist(
    iris[iris["species"] == "versicolor"]["petal_length"],
    bins=30,
    alpha=0.5,
    label="versicolor",
)
plt.hist(
    iris[iris["species"] == "virginica"]["petal_length"],
    bins=30,
    alpha=0.5,
    label="virginica",
)

plt.title("Iris Species Distribution by Petal Length", fontsize=18)
plt.xlabel("Petal Length (cm)", fontsize=14)
plt.ylabel("Count", fontsize=14)
plt.xlim(0.7, 7.1)
plt.xticks(fontsize=12)
plt.yticks(fontsize=12)
plt.legend(fontsize=12)

plt.tight_layout()
plt.savefig("iris_petal_length_distribution.png", dpi=150)
plt.show()
