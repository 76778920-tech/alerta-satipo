from territorial.adapters.files import LocalResearchFiles, LocalResearchInput, UtcClock
from territorial.adapters.http import PublicGeography
from territorial.application.prepare import PrepareTerritory


def preparation(output):
    return PrepareTerritory(PublicGeography(),LocalResearchFiles(output),LocalResearchInput(),UtcClock())


def training(output):
    from territorial.adapters.sklearn_model import SklearnExperiment
    from territorial.application.training import TrainTerritory
    return TrainTerritory(LocalResearchInput(),LocalResearchFiles(output),SklearnExperiment())


def labeling(output):
    from territorial.application.labeling import LabelTerritory
    return LabelTerritory(LocalResearchInput(),LocalResearchFiles(output))
