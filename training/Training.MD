# Training ML

For each content item added that needs to include ML, add a **UTF-8** encoded CSV file with the training phrases that need to be provided to enhance the model.

The CSV File layout should be **two columns.** The first column is the *training phrase* and the second column is the *ML category*.
i.e. 
- Where is the nearest office,office locations
- What is my balance?,account balance
- Do I get TANF?,tanf

If the category is new be sure to update the **mlCategories** in the MDHS-CSA project to correctly map to a suggestion (and thereby an intent.)

*Duplicate values are not allowed in the training data.* This means generic phrases such as "Yes" can not be trained to multiple categories.

*Add the date the training data was applied to the name of the file so that training can be applied in the correct chronological order.* This will play an import part if phrases are updated across iterations. i.e. **YearMonthDay - Description.csv**

## Purpose

The reasoning for placing this data into source control is to provide a way to train the model as future iterations are carried out.

As new intents or training phrases are manually added tracking them will be critical if we are to re-create a model at either a given point or in it's entirety.

## Automatic Training

As a reminder, a model in the hosted environments is being training continuously on recurring phrases. If applicable, be sure to download the training data that has been applied to those models and then apply it to any newly generated models as well.

This data is located in storage buckets in GCP and is processed periodically by the scheduled **importDataset** function.