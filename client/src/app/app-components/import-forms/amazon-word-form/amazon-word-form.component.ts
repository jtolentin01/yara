import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, Validators, FormControl, FormsModule } from '@angular/forms';
import { FormUtilsService } from '../../../services/form-utils/form-utils.service';
import { ToastService, AngularToastifyModule } from 'angular-toastify';
import { ModalComponent } from '../../modal/modal.component';
import { FormSubmissionService } from '../../../services/form-submission/form-submission.service';
import { RootProviderService } from '../../../services/root-provider/root-provider.service';

interface TableRow {
  id: number;
  addedBy: string;
  title: string;
  words: string;
}

@Component({
  selector: 'app-amazon-word-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AngularToastifyModule, ModalComponent, FormsModule],
  templateUrl: './amazon-word-form.component.html',
  styleUrls: ['./amazon-word-form.component.css']
})
export class AmazonWordFormComponent implements OnInit {
  presetForm: FormGroup;
  importForm: FormGroup;
  presetTitle = new FormControl('');
  newWords = new FormControl('');
  title: string = "Word Presets";
  isModalOpen = false;
  isNewPresetOpen = false;
  wordInput: string = '';
  wordsList: string[] = [];
  tableData: TableRow[] = [];
  inputWord: string[] = [];
  isUpdate: boolean = false;
  updateId: any = '';

  constructor(private formUtilsService: FormUtilsService, private toastService: ToastService, private formSubmissionService: FormSubmissionService, private rootProviderService: RootProviderService) {
    this.importForm = this.formUtilsService.initializeForm([
      { controlName: 'importName', initialValue: '', validators: [Validators.required] },
      { controlName: 'productType', initialValue: 'asin', validators: [Validators.required] },
      { controlName: 'marketPlace', initialValue: 'US', validators: [Validators.required] },
      { controlName: 'words', initialValue: '', validators: [Validators.required] },
      { controlName: 'productIDs', initialValue: '', validators: [Validators.required] },
      { controlName: 'tool', initialValue: 'amazon-word-detector' },
      { controlName: 'status', initialValue: 1 },
    ]);
    this.presetForm = new FormGroup({
      presetTitle: new FormControl('', Validators.required),
      wordInput: new FormControl(''),
      list: new FormControl(this.wordsList),
    });
  }

  ngOnInit(): void {

    this.rootProviderService.provideWords().subscribe((response) => {
      this.tableData = response.wordList.map((data: any) => ({
        id: data._id,
        addedBy: data.createby,
        title: data.title,
        words: data.words
      }));

    })
  }

  submitForm(): void {
    const productId: string[] = this.importForm.value.productIDs.split('\n').map((id: string) => id.trim()).filter((id: string) => id.length > 0); 
    const productType: string = this.importForm.value.productType;
    event?.preventDefault();
    if(this.inputWord.length === 0){
      this.toastService.error('Words to detect cannot be empty!');
    }
    if(this.importForm.value.productIDs.length === 0){
      this.toastService.error('ASIN cannot be empty!');
    }
    if (productType === 'asin') {
      const invalidIds: string[] = productId.filter((id: string) => id.length !== 10);
      if (invalidIds.length > 0) {
        this.toastService.error(`Some product IDs are invalid, Please import a valid ASIN`);
        return;
      }
      else{
        const productIDsControl = this.importForm.get('words');
        productIDsControl?.setValue(this.inputWord);
        this.formUtilsService.submitForm(this.importForm);
        window.location.href = '/downloads';
      }
    }
  }

  addPreset(): void {
    this.isNewPresetOpen = true;
  }

  closeNewPreset(): void {
    this.isNewPresetOpen = false;
  }

  openPresets() {
    this.isModalOpen = true;
  }

  openNewPreset(update = false): void {
    this.isNewPresetOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  closePresetModal(): void {
    this.isNewPresetOpen = false;
  }

  resetWords(): void {
    this.inputWord = [];
  }

  import(id: number): void {
    const row = this.tableData.find((row) => row.id === id);

    if (row) {
      row.id = id;
      this.inputWord.push(...row.words);

      this.closeModal();
    } else {
      this.toastService.error('Something went wrong!');
    }
  }

  deleteTemplate(id: number): void {
    if (window.confirm('Are you sure you want to delete?')) {
      this.formSubmissionService.submitDeleteWordPreset(id).subscribe(response => {
        this.toastService.success('Successfully Deleted!');
        this.rootProviderService.provideWords().subscribe((response) => {
          this.tableData = response.wordList.map((data: any) => ({
            id: data._id,
            addedBy: data.createby,
            title: data.title,
            words: data.words
          }));

        })
      })
    }
  }

  updateTemplate(id: number, words: any, title: any): void {
    const formTitle = this.presetForm.get('presetTitle');
    const formList = this.presetForm.get('list');
    this.wordsList = [...words];
    formTitle?.setValue(title);
    formList?.setValue(words);
    this.isUpdate = true;
    this.updateId = id;
    this.openNewPreset(true);
  }

  addWord(): void {
    const wordInput = this.presetForm.get('wordInput');
    if (wordInput) {
      const newWord = wordInput.value?.trim();

      if (newWord) {
        if (this.wordsList.includes(newWord)) {
          this.toastService.warn(`This word (${newWord}) already exists in the list.`)
        } else {
          this.wordsList.push(newWord);
        }
        wordInput.reset();
      }
    } else {
      this.toastService.warn('wordInput FormControl is not found.')
    }
  }

  addNewWord(): void {
    event?.preventDefault();
    const value = this.newWords.value;
    if (value && typeof value === 'string' && value.trim() !== '') {
      if (this.inputWord.includes(value)) {
        this.toastService.warn(`This word (${value}) already exists in the list.`)
      } else {
        this.inputWord.push(value.trim());
        this.newWords.setValue('');
      }

    } else {
      this.toastService.error('Please enter a valid word!');
    }
  }

  removeWord(word: string): void {
    this.wordsList = this.wordsList.filter(w => w !== word);
  }

  removeWordFromList(word: string): void {
    this.inputWord = this.inputWord.filter(w => w !== word);
  }

  savePreset() {
    if (this.isUpdate == false) {
      if (this.wordsList.length === 0) {
        this.toastService.warn('Empty!');
      } else {
        this.formSubmissionService.submitNewWordPreset(this.presetForm.value).subscribe(response => {
          this.rootProviderService.provideWords().subscribe((response) => {
            this.tableData = response.wordList.map((data: any) => ({
              id: data._id,
              addedBy: data.createby,
              title: data.title,
              words: data.words
            }));

          })
        });
        this.toastService.success('New preset saved!');
      }
    }
    else{
      if (this.wordsList.length === 0) {
        this.toastService.warn('Empty!');
      } else {

        this.formSubmissionService.submitUpdatedWordPreset(this.presetForm.value.title,this.wordsList,this.updateId).subscribe(response => {
          this.rootProviderService.provideWords().subscribe((response) => {
            this.tableData = response.wordList.map((data: any) => ({
              id: data._id,
              addedBy: data.createby,
              title: data.title,
              words: data.words
            }));
          })
        });
        this.toastService.success('Updated Preset!');
      }
    }
    this.closePresetModal();
    this.presetForm.reset();
    this.wordsList = [];
  }

  onWordInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addWord();
    }
  }
}
