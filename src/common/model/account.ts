interface AccountResponse {
    id?: string
    fullName: string
    displayName: string
    countryCode: string
    phoneNo: string
    email: string
    allowAccess: boolean
    createdBy?: string
    createdAt?: Date
    updatedBy?: string
    updatedAt?: Date
  }

interface AccountRequest {
  fullName: string
  displayName: string
  countryCode: string
  phoneNo?: string
  email?: string
  password: string
}

export { AccountRequest, AccountResponse };
