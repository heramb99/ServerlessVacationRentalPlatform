provider "google" {
  credentials = file("file_name.json")
  project = var.project_id
  region  = var.region
  zone    = var.zone

}
