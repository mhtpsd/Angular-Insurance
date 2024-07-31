import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  Validators,
} from "@angular/forms";
import { Insurance } from "../models/insurance";
import { Router } from "@angular/router";
import { InsurenceService } from "../services/insurance.service";

@Component({
  selector: "app-insurance-form",
  templateUrl: "./insurance-form.component.html",
  styleUrls: ["./insurance-form.component.css"],
})
export class InsuranceFormComponent implements OnInit {
  insuranceForm !: FormGroup;
  @Output() addInsurance = new EventEmitter<Insurance>();
 
  constructor(private fb: FormBuilder,private insuranceService:InsurenceService, private router:Router) { }

  positiveNumberValidator(control: FormControl): ValidationErrors | null {
    const value = control.value;
    // Check if the value is a positive number
    if (value !== null && value !== '' && value > 0) {
      return null; // validation passes
    } else {
      return { 'notPositive': true }; // return an error object if the condition is not met
    }
  }
  
  dateRangeValidator(group: FormGroup): ValidationErrors | null {
  const startDate = group.controls['policyStartDate'].value;
  const endDate = group.controls['policyEndDate'].value;

  // Check if both dates are present and if the end date is before the start date
  if (startDate && endDate && endDate < startDate) {
    // Set the custom error message
    group.controls['policyEndDate'].setErrors({ dateRangeInvalid: 'End date must be after start date' });
    return { 'dateRangeInvalid': true };
  }
  return null; // If conditions are met or dates are not entered, return null (no error)
}


  ngOnInit(): void {
     // Initialize the form with validators
     this.insuranceForm = this.fb.group({
      policyNumber: ["", [Validators.required,this.uniqueIdValidator]],
      policyHolder: ["", [Validators.required]],
      type: ["", [Validators.required]],
      premiumAmount: [null, [Validators.required, this.positiveNumberValidator]],
      policyStartDate: ["", [Validators.required, this.dateValidator]],
       policyEndDate: ["", [Validators.required, this.dateValidator]],
      benefits: ["", [Validators.required]],
    }, { validators: this.dateRangeValidator });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(control.value)) {
      return { invalidDate: true };
    }
    return null;
  }

  // Function to submit the form
  onSubmit() {
    if (this.insuranceForm.valid) {
      // Form is valid, you can submit it
      this.insuranceService.addInsurance(this.insuranceForm.value).subscribe((res) => {
        this.router.navigateByUrl('insurance-list')

      });
      
    } else { 
      // Form is invalid, display error messages
      this.markFormGroupTouched(this.insuranceForm);
    }
  }

  // Helper function to mark all controls in the form group as touched
  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach((control) => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }


  uniqueIdValidator (control: AbstractControl): ValidationErrors | null  {
    const employeeID = control.value;
    let value=JSON.parse(localStorage.getItem('InsuranceData') || '{}');
      const policyIDd = value.map((id:any) => id.policyNumber);
      if (policyIDd.includes(employeeID)) {
       return { unique: true }; // Validation failed because the ID is not unique
     } 
      return null; // Validation passed, ID is unique
  }
}