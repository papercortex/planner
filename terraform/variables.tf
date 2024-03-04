
variable "aws_region" {
  type        = string
  description = "The AWS region where resources will be created."
  default     = "us-east-1"
}

variable "project_name" {
  type        = string
  description = "The name of the project. This will be used to prefix AWS resources to ensure unique naming and easier identification."
}

variable "environment" {
  type        = string
  description = "The environment in which the infrastructure is being deployed."
}

variable "application_arn" {
  type        = string
  description = "The ARN (Amazon Resource Name) of the application. This is used to uniquely identify the application across AWS services."
}

variable "mongodbatlas_public_key" {
  type        = string
  description = "The public key for MongoDB Atlas."
}

variable "mongodbatlas_private_key" {
  type        = string
  description = "The private key for MongoDB Atlas."
}

variable "mongodbatlas_region" {
  type        = string
  description = "The region where the MongoDB Atlas cluster will be created."
  default     = "US_EAST_1"
}

variable "mongodbatlas_org_id" {
  type        = string
  description = "The ID of the MongoDB organization."
}

variable "mongodbatlas_username" {
  type        = string
  description = "Username for the MongoDB Atlas database user."
}

variable "mongodbatlas_password" {
  type        = string
  description = "Password for the MongoDB Atlas database user."
}

variable "mongodbatlas_user_role_name" {
  type        = string
  description = "The name of the role for the MongoDB Atlas database user."
  default     = "readWrite"
}
