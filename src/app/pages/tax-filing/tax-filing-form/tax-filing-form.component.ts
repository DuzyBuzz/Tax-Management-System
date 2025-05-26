import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc } from '@angular/fire/firestore'; // <-- Add this import

interface Payment {
  name: string;
  taxDue: number | string;
  interest: number | string;
  surcharge: number | string;
}

@Component({
  selector: 'app-tax-filing-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './tax-filing-form.component.html',
  styleUrls: ['./tax-filing-form.component.scss']
})
export class TaxFilingFormComponent {
  form!: FormGroup;
  dueDate = new Date(new Date().getFullYear(), 11, 31);

  grandTotal = 0;
  paymentStatus = 'Unpaid';

  showModal = true; // Add this property

  paymentItems: Payment[] = [
    { name: 'BARANGAY CLEARANCE FEE-MALUSGOD (NEW MARKET)', taxDue: 200, interest: 0, surcharge: 0 },
    { name: 'Occupation Fee', taxDue: 200, interest: 0, surcharge: 0 },
    { name: 'Solid Waste', taxDue: 240, interest: 0, surcharge: 0 },
    { name: 'Fire Inspection Fee', taxDue: 50, interest: 0, surcharge: 0 },
    { name: 'Sanitary', taxDue: 500, interest: 0, surcharge: 0 },
    { name: 'Business Sticker', taxDue: 75, interest: 0, surcharge: 0 },
    { name: 'Business Plate', taxDue: 200, interest: 0, surcharge: 0 },
    { name: 'Garbage Fee', taxDue: 500, interest: 0, surcharge: 0 },
    { name: 'Zoning', taxDue: 216, interest: 0, surcharge: 0 },
    { name: 'Mayors Permit', taxDue: 300, interest: 0, surcharge: 0 },
  ];

  barangays = [
    'Agan-an', 'Agkilo', 'Agtatacay', 'Agtatac', 'Buri', 'Calawag', 'Calmay',
    'Cangcalan', 'Fernando Parcon Ward, Pototan, Iloilo', 'Guimbal', 'Igcococ', 'Jamugpong', 'Lawa-an',
    'Pangpang', 'PRINCE HYPERMART  SAN JOSE ST.  Fernando Parcon Ward, Pototan, Iloilo', 'Quinari', 'San Enrique', 'San Isidro',
    'San Jose', 'San Miguel', 'San Rafael', 'Santa Cruz', 'Santa Rosa',
    'Tabuc', 'Tagpuro', 'Tangal', 'Tigbauan', 'Tinaguiban', 'Tinaplan'
  ];

  @Input() filingId: string | null = null;
  isEditMode = false;

  @Output() close = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private firestore: Firestore) { // <-- Inject Firestore
    this.initializeForm();
    this.setupValueChanges();
    this.calculateGrandTotal();
  }

  ngOnInit() {
    if (this.filingId) {
      // Fetch the filing data from Firestore
      const filingRef = doc(this.firestore, 'tax_filings', this.filingId);
      getDoc(filingRef).then(snapshot => {
        if (snapshot.exists()) {
          this.form.patchValue(snapshot.data());
          // If you have FormArrays (like activities/payments), patch them as well
        }
      });
      this.isEditMode = true;
    } else {
      this.isEditMode = false;
    }
  }

  private initializeForm() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const formattedToday = `${yyyy}-${mm}-${dd}`;

    this.form = this.fb.group({
      businessId: ['', Validators.required],
      topNo: [''],
      typeOfApplication: ['New', Validators.required],
      businessName: ['', Validators.required],
      ownerName: ['', Validators.required],
      numberOfEmployees: [0, [Validators.required, Validators.min(0)]],
      barangay: ['', Validators.required],
      addressDateAssessed: [formattedToday, Validators.required], // <-- Set to today
      taxYear: [new Date().getFullYear(), [Validators.required, Validators.min(1900), Validators.max(2100)]],
      contactNumber: [''],
      status: ['Payment Sent'],
      activities: this.fb.array([
        this.createActivity('', 0, 0, 0)
      ]),
      payments: this.fb.array(this.paymentItems.map(payment => this.fb.group({
        name: [payment.name],
        taxDue: [payment.taxDue, [Validators.required, Validators.min(0)]],
        interest: [payment.interest, [Validators.required, Validators.min(0)]],
        surcharge: [payment.surcharge, [Validators.required, Validators.min(0)]],
      })))
    });
  }

  get payments() {
    return this.form.get('payments') as FormArray;
  }

  // Accept any type for paymentGroup to avoid template typing issues
  getRowTotal(paymentGroup: any): number {
    const taxDue = Number(paymentGroup.get('taxDue')?.value) || 0;
    const interest = Number(paymentGroup.get('interest')?.value) || 0;
    const surcharge = Number(paymentGroup.get('surcharge')?.value) || 0;
    return taxDue + interest + surcharge;
  }

  private calculateGrandTotal() {
    this.grandTotal = this.payments.controls.reduce((total, group) => {
      return total + this.getRowTotal(group);
    }, 0);
  }

  private setupValueChanges() {
    // Subscribe to the entire payments FormArray value changes
    this.payments.valueChanges.subscribe(() => {
      this.calculateGrandTotal();
    });
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      alert('Please fill in all required fields correctly.');
      return;
    }
    const formData = {
      ...this.form.value,
      grandTotal: this.grandTotal // <-- Save grandTotal to Firestore
    };
    try {
      await addDoc(collection(this.firestore, 'tax_filings'), formData);
      alert('Form submitted and saved successfully!');
      this.printForm();
      this.showModal = false;
    } catch (error) {
      alert('Error saving to Firestore: ' + (error as any)?.message || error);
    }
  }
    createActivity(activityName = '', capitalInvestment = 0, essential = 0, nonEssential = 0): FormGroup {
    return this.fb.group({
      activityName: [activityName, Validators.required],
      capitalInvestment: [capitalInvestment, [Validators.required, Validators.min(0)]],
      grossReceiptsEssential: [essential, [Validators.required, Validators.min(0)]],
      grossReceiptsNonEssential: [nonEssential, [Validators.required, Validators.min(0)]],
    });
  }

  get activities(): FormArray {
    return this.form.get('activities') as FormArray;
  }

  addActivity() {
    this.activities.push(this.createActivity());
  }

  removeActivity(index: number) {
    this.activities.removeAt(index);
  }

  // Calculate total capital investment
  get totalCapitalInvestment(): number {
    return this.activities.controls.reduce((sum, group) => sum + Number(group.get('capitalInvestment')?.value || 0), 0);
  }

  // Calculate total gross receipts essential
  get totalGrossReceiptsEssential(): number {
    return this.activities.controls.reduce((sum, group) => sum + Number(group.get('grossReceiptsEssential')?.value || 0), 0);
  }

  // Calculate total gross receipts non-essential
  get totalGrossReceiptsNonEssential(): number {
    return this.activities.controls.reduce((sum, group) => sum + Number(group.get('grossReceiptsNonEssential')?.value || 0), 0);
  }
// Add this method to enable printing the form
printForm(): void {
  const originalTitle = document.title;
  document.title = ''; // Temporarily remove title for printing
  window.print();
  document.title = originalTitle; // Restore title after printing
  this.closeModal();
}

closeModal() {
    this.showModal = false;
  }

  formatNumber(group: FormGroup, controlName: string) {
    let value = group.get(controlName)?.value;
    if (value !== null && value !== undefined && value !== '') {
      // Remove any commas before formatting
      value = value.toString().replace(/,/g, '');
      const num = parseFloat(value);
      if (!isNaN(num)) {
        group.get(controlName)?.setValue(num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }), { emitEvent: false });
      }
    }
  }

  removeFormat(group: FormGroup, controlName: string) {
    let value = group.get(controlName)?.value;
    if (typeof value === 'string') {
      group.get(controlName)?.setValue(value.replace(/,/g, ''), { emitEvent: false });
    }
  }

  async onUpdate() {
    if (this.form.valid && this.filingId) {
      const filingRef = doc(this.firestore, 'tax_filings', this.filingId);
      this.close.emit(); // Emit the close event
      alert('Tax filing updated successfully!');
      this.close.emit();
    }
  }
}
