CREATE TABLE IF NOT EXISTS "admitting" (
  "id" int(10)  NOT NULL ,
  "diagnosisID" int(11) DEFAULT NULL,
  "hospitalID" int(11) DEFAULT NULL,
  "doctorID" int(11) DEFAULT NULL,
  "date" timestamp NULL DEFAULT NULL,
  "roomAssigned" varchar(10) DEFAULT NULL,
  "erOrClinic" text  DEFAULT 'new',
  "pay" text  DEFAULT 'personal',
  "surgery" timestamp NULL DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "appointments" (
  "id" int(10)  NOT NULL ,
  "doctorID" int(11) DEFAULT NULL,
  "patientID" int(11) DEFAULT NULL,
  "staffID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "hospitalID" int(11) DEFAULT NULL,
  "type" text  DEFAULT 'unspecified',
  "date" date DEFAULT NULL,
  "timeStart" time DEFAULT NULL,
  "timeEnd" time DEFAULT NULL,
  "notes" varchar(255) DEFAULT NULL,
  "occured" tinyint(4) DEFAULT NULL,
  "reminder" int(11) DEFAULT NULL,
  "reminderSent" int(11) DEFAULT NULL,
  "roomAssignment" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "bmiRecords" (
  "id" int(10)  NOT NULL ,
  "patientID" int(11) DEFAULT NULL,
  "date" date DEFAULT NULL,
  "weight" int(11) DEFAULT NULL,
  "height" int(11) DEFAULT NULL,
  "bmi" int(11) DEFAULT NULL,
  "head" int(11) DEFAULT NULL,
  "chest" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "cache" (
  "key" varchar(255) NOT NULL,
  "value" text COLLATE NOCASE,
  "expiration" int(11) NOT NULL
);
CREATE TABLE IF NOT EXISTS "cptCategories" (
  "id" int(10)  NOT NULL ,
  "value" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "cpts" (
  "id" int(10)  NOT NULL ,
  "cptCategoriesID" int(11) DEFAULT NULL,
  "description" text COLLATE NOCASE,
  "code" varchar(11) DEFAULT NULL,
  "version" varchar(32) DEFAULT '1',
  "classification" text  DEFAULT 'major',
  "subCptCategories1ID" varchar(255) DEFAULT NULL,
  "subCptCategories2ID" varchar(255) DEFAULT NULL,
  "subCptCategories3ID" varchar(255) DEFAULT NULL,
  "subCptCategories4ID" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "diagnosis" (
  "id" int(10)  NOT NULL ,
  "patientID" int(11) NOT NULL,
  "doctorID" int(11) DEFAULT NULL,
  "appointmentID" int(11) DEFAULT NULL,
  "preparedByID" int(11) DEFAULT NULL,
  "chiefComplaint" text COLLATE NOCASE,
  "historyIllness" text COLLATE NOCASE,
  "bodyTemperature" varchar(255) DEFAULT NULL,
  "bloodPressure" varchar(255) DEFAULT NULL,
  "respirationRate" varchar(255) DEFAULT NULL,
  "pulseRate" varchar(255) DEFAULT NULL,
  "medicalHistory" text COLLATE NOCASE,
  "initialDiagnosis" text COLLATE NOCASE,
  "physicalExam" text COLLATE NOCASE,
  "services" varchar(255) DEFAULT NULL,
  "type" varchar(30) DEFAULT NULL,
  "code" varchar(30) DEFAULT NULL,
  "category" varchar(30) DEFAULT NULL,
  "plan" text COLLATE NOCASE,
  "pay" text  DEFAULT 'personal',
  "referringDoctor" text COLLATE NOCASE,
  "labs" text COLLATE NOCASE,
  "imaging" text COLLATE NOCASE,
  "accident" varchar(15) DEFAULT 'f',
  "painLevel" tinyint(4) DEFAULT NULL,
  "allergies" text COLLATE NOCASE,
  "currentMedications" text COLLATE NOCASE,
  "date" date DEFAULT NULL,
  "timeStart" time DEFAULT NULL,
  "timeEnd" time DEFAULT NULL,
  "certRemarks" text COLLATE NOCASE,
  "certPurpose" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "diagnosisIcds" (
  "id" int(10)  NOT NULL ,
  "diagnosisID" int(11) DEFAULT NULL,
  "icdID" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "discharging" (
  "id" int(10)  NOT NULL ,
  "postDiagnosisID" int(11) DEFAULT NULL,
  "admittingID" int(11) DEFAULT NULL,
  "complications" varchar(225) DEFAULT NULL,
  "finalDiagnosis" varchar(225) DEFAULT NULL,
  "date" date DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "doctors" (
  "id" int(10)  NOT NULL ,
  "groupID" int(11) DEFAULT NULL,
  "patientID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "firstname" varchar(30) DEFAULT NULL,
  "middlename" varchar(30) DEFAULT NULL,
  "lastname" varchar(30) DEFAULT NULL,
  "nameSuffix" varchar(10) DEFAULT NULL,
  "birthdate" date DEFAULT NULL,
  "sex" tinyint(4) DEFAULT NULL,
  "status" text  DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "initial" varchar(5) DEFAULT NULL,
  "type" varchar(30) DEFAULT NULL,
  "code" int(11) DEFAULT NULL,
  "phone1" varchar(15) DEFAULT NULL,
  "phone2" varchar(15) DEFAULT NULL,
  "rank" varchar(30) DEFAULT NULL,
  "email" varchar(30) DEFAULT NULL,
  "licenseID" varchar(30) DEFAULT NULL,
  "imagePath" varchar(255) DEFAULT NULL,
  "imageMime" varchar(20) DEFAULT 'jpg',
  "allowAsPatient" tinyint(4) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "followup" (
  "id" int(10)  NOT NULL ,
  "diagnosisID" varchar(255) DEFAULT NULL,
  "date" date DEFAULT NULL,
  "time" time DEFAULT NULL,
  "findings" text COLLATE NOCASE,
  "implants" text COLLATE NOCASE,
  "antibiotics" text COLLATE NOCASE,
  "transfusion" varchar(32) DEFAULT NULL,
  "description" text COLLATE NOCASE,
  "name" text COLLATE NOCASE,
  "emergencyOrElective" text  DEFAULT 'elective',
  "pay" text  DEFAULT 'personal',
  "leadSurgeon" tinyint(4) DEFAULT NULL,
  "otherDoctors" varchar(255) DEFAULT NULL,
  "labs" text COLLATE NOCASE,
  "xrays" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "followupIcds" (
  "id" int(10)  NOT NULL ,
  "followupID" int(11) DEFAULT NULL,
  "icdID" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "genericMedicine" (
  "id" int(10)  NOT NULL ,
  "name" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "groupMembers" (
  "id" int(10)  NOT NULL ,
  "groupID" int(11) DEFAULT NULL,
  "memberID" int(11) DEFAULT NULL,
  "memberType" text  DEFAULT 'doctor',
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "groups" (
  "id" int(10)  NOT NULL ,
  "name" varchar(100) DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "owner" varchar(100) DEFAULT NULL,
  "licenseNum" varchar(100) DEFAULT NULL,
  "status" tinyint(4) NOT NULL DEFAULT '0',
  "established" varchar(4) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "logo" longblob,
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "hospitalAffiliatedFacility" (
  "id" int(10)  NOT NULL ,
  "hospitalID" int(11) DEFAULT NULL,
  "name" varchar(30) DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "hospitals" (
  "id" int(10)  NOT NULL ,
  "name" varchar(50) DEFAULT NULL,
  "initial" varchar(5) DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "email" varchar(100) DEFAULT NULL,
  "website" varchar(100) DEFAULT NULL,
  "trunkLine" varchar(32) DEFAULT NULL,
  "admittingTelNum" varchar(32) DEFAULT NULL,
  "admittingCoordinator" text COLLATE NOCASE,
  "billingTelNum" varchar(32) DEFAULT NULL,
  "billingCoordinator" text COLLATE NOCASE,
  "patientRelationsTelNum" varchar(32) DEFAULT NULL,
  "patientRelationsCoordinator" text COLLATE NOCASE,
  "socialWelfareTelNum" varchar(32) DEFAULT NULL,
  "socialWelfareCoordinator" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "icdCategories" (
  "id" int(10)  NOT NULL ,
  "value" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "icds" (
  "id" int(10)  NOT NULL ,
  "icdCategoriesID" int(11) DEFAULT NULL,
  "code" varchar(32) DEFAULT NULL,
  "description" text COLLATE NOCASE,
  "version" varchar(32) DEFAULT NULL,
  "subIcdCategories1ID" varchar(255) DEFAULT NULL,
  "subIcdCategories2ID" varchar(255) DEFAULT NULL,
  "subIcdCategories3ID" varchar(255) DEFAULT NULL,
  "subIcdCategories4ID" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "labItem" (
  "id" int(10)  NOT NULL ,
  "labItemClassID" int(11) DEFAULT NULL,
  "groupID" int(11) DEFAULT NULL,
  "name" varchar(100) DEFAULT NULL,
  "rangeOfVal" text COLLATE NOCASE,
  "isNumeric" tinyint(4) DEFAULT '0',
  "unit" char(30) DEFAULT NULL,
  "normalMinValue" decimal(10,5) DEFAULT NULL,
  "normalMaxValue" decimal(10,5) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "labItemClass" (
  "id" int(10)  NOT NULL ,
  "value" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "labwork" (
  "id" int(10)  NOT NULL ,
  "patientID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "orderDate" date DEFAULT NULL,
  "completionDate" date DEFAULT NULL,
  "completed" tinyint(4) DEFAULT NULL,
  "labData" text COLLATE NOCASE,
  "viewed" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "medicineDosages" (
  "id" int(10)  NOT NULL ,
  "medicineID" int(11) DEFAULT NULL,
  "dosage" varchar(100) DEFAULT NULL,
  "form" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "medicines" (
  "id" int(10)  NOT NULL ,
  "genericMedicineID" int(11) DEFAULT NULL,
  "groupID" int(11) DEFAULT NULL,
  "properName" varchar(255) DEFAULT NULL,
  "manufacturer" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "migrations" (
  "migration" varchar(255) NOT NULL,
  "batch" int(11) NOT NULL
);
CREATE TABLE IF NOT EXISTS "nurses" (
  "id" int(10)  NOT NULL ,
  "groupID" int(11) DEFAULT NULL,
  "patientID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "firstname" varchar(30) DEFAULT NULL,
  "middlename" varchar(30) DEFAULT NULL,
  "lastname" varchar(30) DEFAULT NULL,
  "nameSuffix" varchar(10) DEFAULT NULL,
  "birthdate" date DEFAULT NULL,
  "sex" tinyint(4) DEFAULT NULL,
  "status" text  DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "type" varchar(30) DEFAULT NULL,
  "phone1" varchar(15) DEFAULT NULL,
  "phone2" varchar(15) DEFAULT NULL,
  "position" varchar(30) DEFAULT NULL,
  "email" varchar(30) DEFAULT NULL,
  "licenseID" varchar(30) DEFAULT NULL,
  "imagePath" varchar(255) DEFAULT NULL,
  "imageMime" varchar(20) DEFAULT 'jpg',
  "allowAsPatient" tinyint(4) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "password_resets" (
  "email" varchar(255) NOT NULL,
  "token" varchar(255) NOT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00'
);
CREATE TABLE IF NOT EXISTS "patientImages" (
  "id" int(10)  NOT NULL ,
  "patientID" int(11) DEFAULT NULL,
  "assocRecordID" int(11) DEFAULT NULL,
  "image" varchar(255) DEFAULT NULL,
  "image1" varchar(255) DEFAULT NULL,
  "imageAnnotation" text COLLATE NOCASE,
  "forDisplay" bigint(20) DEFAULT NULL,
  "imageType" varchar(32) DEFAULT NULL,
  "imageModule" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "patients" (
  "id" int(10)  NOT NULL ,
  "otherID" int(11) DEFAULT NULL,
  "groupID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "primaryDoc" int(11) DEFAULT NULL,
  "secondaryDoc" int(11) DEFAULT NULL,
  "referredByID" int(11) DEFAULT NULL,
  "code" int(11) DEFAULT NULL,
  "category" varchar(30) DEFAULT NULL,
  "firstname" varchar(30) DEFAULT NULL,
  "lastname" varchar(30) DEFAULT NULL,
  "middlename" varchar(30) DEFAULT NULL,
  "nickname" varchar(30) DEFAULT NULL,
  "birthdate" date DEFAULT NULL,
  "birthPlace" varchar(50) DEFAULT NULL,
  "religion" text COLLATE NOCASE,
  "address" text COLLATE NOCASE,
  "status" text  DEFAULT NULL,
  "occupation" varchar(30) DEFAULT NULL,
  "sex" tinyint(4) DEFAULT NULL,
  "race" varchar(30) DEFAULT NULL,
  "nationality" varchar(30) DEFAULT NULL,
  "height" varchar(11) DEFAULT NULL,
  "hmoID" varchar(30) DEFAULT NULL,
  "hmo" varchar(100) DEFAULT NULL,
  "hmoCode" varchar(100) DEFAULT NULL,
  "telHome" varchar(15) DEFAULT NULL,
  "telOffice" varchar(15) DEFAULT NULL,
  "telMobile" varchar(15) DEFAULT NULL,
  "email" varchar(30) DEFAULT NULL,
  "company" varchar(100) DEFAULT NULL,
  "companyAddress" text COLLATE NOCASE,
  "companyContact" varchar(15) DEFAULT NULL,
  "companyID" varchar(30) DEFAULT NULL,
  "personNotify" varchar(30) DEFAULT NULL,
  "personMobile" varchar(15) DEFAULT NULL,
  "personRelation" varchar(50) DEFAULT NULL,
  "personAddress" varchar(100) DEFAULT NULL,
  "insuranceProvider" varchar(255) DEFAULT NULL,
  "accountVerified" varchar(255) NOT NULL DEFAULT '0',
  "policyNumber" varchar(15) DEFAULT NULL,
  "imagePath" varchar(255) DEFAULT NULL,
  "imageMime" varchar(20) DEFAULT 'jpg',
  "isPedia" tinyint(4) DEFAULT '0',
  "fatherName" varchar(30) DEFAULT NULL,
  "motherName" varchar(30) DEFAULT NULL,
  "guardianName" varchar(30) DEFAULT NULL,
  "spouseName" varchar(30) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "peCategories" (
  "id" int(10)  NOT NULL ,
  "value" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "peTemplates" (
  "id" int(10)  NOT NULL ,
  "text" text COLLATE NOCASE,
  "title" varchar(100) DEFAULT NULL,
  "peCategories1ID" int(11) DEFAULT NULL,
  "peCategories2ID" int(11) DEFAULT NULL,
  "peCategories3ID" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "postDiagnosis" (
  "id" int(10)  NOT NULL ,
  "diagnosisID" int(11) DEFAULT NULL,
  "followupID" int(11) DEFAULT NULL,
  "medication" text COLLATE NOCASE,
  "rehabPlan" text COLLATE NOCASE,
  "hospitalCourse" text COLLATE NOCASE,
  "ambulatoryAids" text COLLATE NOCASE,
  "physTherapy" text COLLATE NOCASE,
  "cultWound" text COLLATE NOCASE,
  "cultJoint" text COLLATE NOCASE,
  "cultBlood" text COLLATE NOCASE,
  "labsOther" text COLLATE NOCASE,
  "labsHemoglobin" text COLLATE NOCASE,
  "labsHematocrit" text COLLATE NOCASE,
  "labsPotassium" text COLLATE NOCASE,
  "radiographs" text COLLATE NOCASE,
  "preparedBy" text COLLATE NOCASE,
  "preparedFor" text COLLATE NOCASE,
  "relatedImages" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "prescriptions" (
  "id" int(10)  NOT NULL ,
  "patientID" int(11) DEFAULT NULL,
  "doctorID" int(11) DEFAULT NULL,
  "frequency" text COLLATE NOCASE,
  "dateIssued" date DEFAULT NULL,
  "notes" text COLLATE NOCASE,
  "medicineID" int(11) DEFAULT NULL,
  "textDrugName" varchar(30) DEFAULT NULL,
  "textDrugDosage" varchar(100) DEFAULT NULL,
  "textDrugData" text COLLATE NOCASE,
  "pharmacyDrugData" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "procedureCategories" (
  "id" int(10)  NOT NULL ,
  "value" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "procedureCpts" (
  "id" int(10)  NOT NULL ,
  "procedureID" int(11) DEFAULT NULL,
  "cptID" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "procedureDoctors" (
  "id" int(10)  NOT NULL ,
  "procedureID" int(11) DEFAULT NULL,
  "doctorID" int(11) DEFAULT NULL,
  "role" varchar(30) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "procedureTemplates" (
  "id" int(10)  NOT NULL ,
  "text" text COLLATE NOCASE,
  "title" varchar(100) DEFAULT NULL,
  "procedureCategories1ID" int(11) DEFAULT NULL,
  "procedureCategories2ID" int(11) DEFAULT NULL,
  "procedureCategories3ID" int(11) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "procedures" (
  "id" int(10)  NOT NULL ,
  "diagnosisID" int(11) DEFAULT NULL,
  "date" date DEFAULT NULL,
  "position" varchar(255) DEFAULT NULL,
  "findings" text COLLATE NOCASE,
  "anesthesia" varchar(255) DEFAULT NULL,
  "bloodLoss" varchar(32) DEFAULT NULL,
  "timeStart" time DEFAULT NULL,
  "timeEnd" time DEFAULT NULL,
  "implants" text COLLATE NOCASE,
  "antibiotics" text COLLATE NOCASE,
  "transfusion" varchar(32) DEFAULT NULL,
  "proDescription" text COLLATE NOCASE,
  "proName" text COLLATE NOCASE,
  "emergencyOrElective" text  DEFAULT 'elective',
  "pay" text  DEFAULT 'personal',
  "leadSurgeon" tinyint(4) DEFAULT NULL,
  "otherDoctors" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "staff" (
  "id" int(10)  NOT NULL ,
  "groupID" int(11) DEFAULT NULL,
  "patientID" int(11) DEFAULT NULL,
  "userID" int(11) DEFAULT NULL,
  "firstname" varchar(30) DEFAULT NULL,
  "middlename" varchar(30) DEFAULT NULL,
  "lastname" varchar(30) DEFAULT NULL,
  "nameSuffix" varchar(10) DEFAULT NULL,
  "birthdate" date DEFAULT NULL,
  "sex" tinyint(4) DEFAULT NULL,
  "status" text  DEFAULT NULL,
  "address" text COLLATE NOCASE,
  "type" varchar(30) DEFAULT NULL,
  "phone1" varchar(15) DEFAULT NULL,
  "phone2" varchar(15) DEFAULT NULL,
  "position" varchar(30) DEFAULT NULL,
  "email" varchar(30) DEFAULT NULL,
  "imagePath" varchar(255) DEFAULT NULL,
  "imageMime" varchar(20) DEFAULT 'jpg',
  "allowAsPatient" tinyint(4) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "tableLogger" (
  "id" int(10)  NOT NULL ,
  "userID" int(11) DEFAULT NULL,
  "name" text COLLATE NOCASE,
  "operation" text  DEFAULT NULL,
  "sqlExecuted" text COLLATE NOCASE,
  "entryKey" varchar(255) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "userAccessLevel" (
  "id" tinyint(4) NOT NULL,
  "value" varchar(10) NOT NULL
);
CREATE TABLE IF NOT EXISTS "users" (
  "id" int(10)  NOT NULL ,
  "groupID" int(11) DEFAULT NULL,
  "userAccessLevelID" tinyint(4) DEFAULT NULL,
  "username" varchar(255) DEFAULT NULL,
  "password" varchar(60) DEFAULT NULL,
  "email" varchar(30) DEFAULT NULL,
  "userType" text  DEFAULT NULL,
  "failedLogin" tinyint(4) DEFAULT NULL,
  "hashCode" varchar(32) DEFAULT NULL,
  "peerID" varchar(32) DEFAULT NULL,
  "emailVerified" tinyint(4) DEFAULT NULL,
  "accountVerified" tinyint(4) DEFAULT NULL,
  "active" tinyint(4) DEFAULT '0',
  "online" tinyint(4) DEFAULT '0',
  "remember_token" varchar(100) DEFAULT NULL,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "vaccineRecords" (
  "id" int(10)  NOT NULL ,
  "vaccineID" int(11) DEFAULT NULL,
  "dateTaken" date DEFAULT NULL,
  "reaction" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "vaccines" (
  "id" int(10)  NOT NULL ,
  "medicineID" int(11) DEFAULT NULL,
  "patientID" int(11) DEFAULT NULL,
  "doctorID" int(11) DEFAULT NULL,
  "notes" text COLLATE NOCASE,
  "deleted_at" timestamp NULL DEFAULT NULL,
  "created_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  "updated_at" timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY ("id")
);
CREATE INDEX "cache_cache_key_unique" ON "cache" ("key");
CREATE INDEX "userAccessLevel_useraccesslevel_value_unique" ON "userAccessLevel" ("value");
CREATE INDEX "users_users_username_unique" ON "users" ("username");
CREATE INDEX "users_users_email_unique" ON "users" ("email");
CREATE INDEX "password_resets_password_resets_email_index" ON "password_resets" ("email");
CREATE INDEX "password_resets_password_resets_token_index" ON "password_resets" ("token");
