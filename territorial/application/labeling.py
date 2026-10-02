from territorial.application.ports import ResearchInput, ResearchFiles
from territorial.domain.labels import attach_labels


class LabelTerritory:
    def __init__(self, inputs: ResearchInput, files: ResearchFiles):
        self.inputs,self.files=inputs,files

    def execute(self, dataset, labels, output_name):
        frame=self.inputs.read_frame(dataset,dtype={'ubigeo':str})
        evidence=self.inputs.read_frame(labels,dtype=str,keep_default_na=False)
        result=attach_labels(frame,evidence)
        self.files.write_frame(output_name,result)
        return result
