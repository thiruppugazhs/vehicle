class VehicleModel {
  final String id;
  final String registrationNumber;
  final String name;
  final String type;
  final String manufacturer;
  final String model;
  final String variant;
  final int year;
  final int currentOdometer;
  final int healthScore;
  final String status; // 'Active', 'Due for Service', 'Overdue', 'Under Repair', 'Inactive'
  final String fuelType;
  final String transmission;
  final String? assignedDriverId;
  final String organizationId;
  final String? imageUrl;

  VehicleModel({
    required this.id,
    required this.registrationNumber,
    required this.name,
    required this.type,
    required this.manufacturer,
    required this.model,
    this.variant = '',
    required this.year,
    required this.currentOdometer,
    this.healthScore = 100,
    required this.status,
    required this.fuelType,
    required this.transmission,
    this.assignedDriverId,
    required this.organizationId,
    this.imageUrl,
  });

  factory VehicleModel.fromJson(Map<String, dynamic> json, String id) {
    return VehicleModel(
      id: id,
      registrationNumber: json['registrationNumber'] ?? '',
      name: json['name'] ?? '',
      type: json['type'] ?? 'Truck',
      manufacturer: json['manufacturer'] ?? '',
      model: json['model'] ?? '',
      variant: json['variant'] ?? '',
      year: json['year'] is int ? json['year'] : int.tryParse('${json['year']}') ?? 2024,
      currentOdometer: json['currentOdometer'] is int ? json['currentOdometer'] : int.tryParse('${json['currentOdometer']}') ?? 0,
      healthScore: json['healthScore'] is int ? json['healthScore'] : int.tryParse('${json['healthScore']}') ?? 100,
      status: json['status'] ?? 'Active',
      fuelType: json['fuelType'] ?? 'Diesel',
      transmission: json['transmission'] ?? 'Manual',
      assignedDriverId: json['assignedDriverId'],
      organizationId: json['organizationId'] ?? 'org_01',
      imageUrl: json['imageUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'registrationNumber': registrationNumber,
      'name': name,
      'type': type,
      'manufacturer': manufacturer,
      'model': model,
      'variant': variant,
      'year': year,
      'currentOdometer': currentOdometer,
      'healthScore': healthScore,
      'status': status,
      'fuelType': fuelType,
      'transmission': transmission,
      'assignedDriverId': assignedDriverId,
      'organizationId': organizationId,
      'imageUrl': imageUrl,
    };
  }

  VehicleModel copyWith({
    int? currentOdometer,
    int? healthScore,
    String? status,
    String? assignedDriverId,
  }) {
    return VehicleModel(
      id: id,
      registrationNumber: registrationNumber,
      name: name,
      type: type,
      manufacturer: manufacturer,
      model: model,
      variant: variant,
      year: year,
      currentOdometer: currentOdometer ?? this.currentOdometer,
      healthScore: healthScore ?? this.healthScore,
      status: status ?? this.status,
      fuelType: fuelType,
      transmission: transmission,
      assignedDriverId: assignedDriverId ?? this.assignedDriverId,
      organizationId: organizationId,
      imageUrl: imageUrl,
    );
  }
}

class MaintenanceRecordModel {
  final String id;
  final String vehicleId;
  final String vehicleReg;
  final String title;
  final String serviceType;
  final String serviceDate;
  final int odometerReading;
  final double totalCost;
  final String serviceCenterName;
  final String? technician;
  final String? nextDueDate;
  final int? nextDueOdometer;
  final String? notes;
  final String organizationId;

  MaintenanceRecordModel({
    required this.id,
    required this.vehicleId,
    required this.vehicleReg,
    required this.title,
    required this.serviceType,
    required this.serviceDate,
    required this.odometerReading,
    required this.totalCost,
    required this.serviceCenterName,
    this.technician,
    this.nextDueDate,
    this.nextDueOdometer,
    this.notes,
    required this.organizationId,
  });

  factory MaintenanceRecordModel.fromJson(Map<String, dynamic> json, String id) {
    return MaintenanceRecordModel(
      id: id,
      vehicleId: json['vehicleId'] ?? '',
      vehicleReg: json['vehicleReg'] ?? '',
      title: json['title'] ?? '',
      serviceType: json['serviceType'] ?? 'Routine Service',
      serviceDate: json['serviceDate'] ?? DateTime.now().toIso8601String().substring(0, 10),
      odometerReading: json['odometerReading'] is int ? json['odometerReading'] : int.tryParse('${json['odometerReading']}') ?? 0,
      totalCost: (json['totalCost'] is num) ? (json['totalCost'] as num).toDouble() : double.tryParse('${json['totalCost']}') ?? 0.0,
      serviceCenterName: json['serviceCenterName'] ?? 'Authorized Center',
      technician: json['technician'],
      nextDueDate: json['nextDueDate'],
      nextDueOdometer: json['nextDueOdometer'] is int ? json['nextDueOdometer'] : int.tryParse('${json['nextDueOdometer']}'),
      notes: json['notes'],
      organizationId: json['organizationId'] ?? 'org_01',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vehicleId': vehicleId,
      'vehicleReg': vehicleReg,
      'title': title,
      'serviceType': serviceType,
      'serviceDate': serviceDate,
      'odometerReading': odometerReading,
      'totalCost': totalCost,
      'serviceCenterName': serviceCenterName,
      'technician': technician,
      'nextDueDate': nextDueDate,
      'nextDueOdometer': nextDueOdometer,
      'notes': notes,
      'organizationId': organizationId,
    };
  }
}

class RepairTicketModel {
  final String id;
  final String vehicleId;
  final String vehicleReg;
  final String issueTitle;
  final String issueCategory;
  final String description;
  final String severity; // 'Minor', 'Moderate', 'Major', 'Critical'
  final String status; // 'Reported', 'Inspection', 'Estimate', 'Approval', 'Repair In Progress', 'Completed', 'Closed'
  final String reportedDate;
  final double estimatedCost;
  final double actualCost;
  final int downtimeHours;
  final String? assignedTechnician;
  final List<String> photoUrls;
  final String organizationId;

  RepairTicketModel({
    required this.id,
    required this.vehicleId,
    required this.vehicleReg,
    required this.issueTitle,
    required this.issueCategory,
    required this.description,
    required this.severity,
    required this.status,
    required this.reportedDate,
    this.estimatedCost = 0.0,
    this.actualCost = 0.0,
    this.downtimeHours = 0,
    this.assignedTechnician,
    this.photoUrls = const [],
    required this.organizationId,
  });

  factory RepairTicketModel.fromJson(Map<String, dynamic> json, String id) {
    return RepairTicketModel(
      id: id,
      vehicleId: json['vehicleId'] ?? '',
      vehicleReg: json['vehicleReg'] ?? '',
      issueTitle: json['issueTitle'] ?? '',
      issueCategory: json['issueCategory'] ?? 'General',
      description: json['description'] ?? '',
      severity: json['severity'] ?? 'Moderate',
      status: json['status'] ?? 'Reported',
      reportedDate: json['reportedDate'] ?? DateTime.now().toIso8601String().substring(0, 10),
      estimatedCost: (json['estimatedCost'] is num) ? (json['estimatedCost'] as num).toDouble() : 0.0,
      actualCost: (json['actualCost'] is num) ? (json['actualCost'] as num).toDouble() : 0.0,
      downtimeHours: json['downtimeHours'] is int ? json['downtimeHours'] : int.tryParse('${json['downtimeHours']}') ?? 0,
      assignedTechnician: json['assignedTechnician'],
      photoUrls: json['photoUrls'] != null ? List<String>.from(json['photoUrls']) : [],
      organizationId: json['organizationId'] ?? 'org_01',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vehicleId': vehicleId,
      'vehicleReg': vehicleReg,
      'issueTitle': issueTitle,
      'issueCategory': issueCategory,
      'description': description,
      'severity': severity,
      'status': status,
      'reportedDate': reportedDate,
      'estimatedCost': estimatedCost,
      'actualCost': actualCost,
      'downtimeHours': downtimeHours,
      'assignedTechnician': assignedTechnician,
      'photoUrls': photoUrls,
      'organizationId': organizationId,
    };
  }

  RepairTicketModel copyWith({
    String? status,
    double? actualCost,
    int? downtimeHours,
    String? assignedTechnician,
  }) {
    return RepairTicketModel(
      id: id,
      vehicleId: vehicleId,
      vehicleReg: vehicleReg,
      issueTitle: issueTitle,
      issueCategory: issueCategory,
      description: description,
      severity: severity,
      status: status ?? this.status,
      reportedDate: reportedDate,
      estimatedCost: estimatedCost,
      actualCost: actualCost ?? this.actualCost,
      downtimeHours: downtimeHours ?? this.downtimeHours,
      assignedTechnician: assignedTechnician ?? this.assignedTechnician,
      photoUrls: photoUrls,
      organizationId: organizationId,
    );
  }
}

class ExpenseModel {
  final String id;
  final String vehicleId;
  final String category; // 'Fuel', 'Maintenance', 'Insurance', 'Toll', 'Tax', 'Repair'
  final double amount;
  final String date;
  final String vendor;
  final String? notes;
  final String organizationId;

  ExpenseModel({
    required this.id,
    required this.vehicleId,
    required this.category,
    required this.amount,
    required this.date,
    required this.vendor,
    this.notes,
    required this.organizationId,
  });

  factory ExpenseModel.fromJson(Map<String, dynamic> json, String id) {
    return ExpenseModel(
      id: id,
      vehicleId: json['vehicleId'] ?? '',
      category: json['category'] ?? 'Fuel',
      amount: (json['amount'] is num) ? (json['amount'] as num).toDouble() : double.tryParse('${json['amount']}') ?? 0.0,
      date: json['date'] ?? DateTime.now().toIso8601String().substring(0, 10),
      vendor: json['vendor'] ?? 'Vendor',
      notes: json['notes'],
      organizationId: json['organizationId'] ?? 'org_01',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vehicleId': vehicleId,
      'category': category,
      'amount': amount,
      'date': date,
      'vendor': vendor,
      'notes': notes,
      'organizationId': organizationId,
    };
  }
}

class VehicleDocumentModel {
  final String id;
  final String vehicleId;
  final String documentType; // 'Insurance', 'Registration Certificate', 'PUC', 'Fitness Certificate'
  final String documentNumber;
  final String issueDate;
  final String expiryDate;
  final String status; // 'Valid', 'Expiring Soon', 'Expired'
  final String? fileUrl;
  final String organizationId;

  VehicleDocumentModel({
    required this.id,
    required this.vehicleId,
    required this.documentType,
    required this.documentNumber,
    required this.issueDate,
    required this.expiryDate,
    required this.status,
    this.fileUrl,
    required this.organizationId,
  });

  factory VehicleDocumentModel.fromJson(Map<String, dynamic> json, String id) {
    return VehicleDocumentModel(
      id: id,
      vehicleId: json['vehicleId'] ?? '',
      documentType: json['documentType'] ?? 'Insurance',
      documentNumber: json['documentNumber'] ?? '',
      issueDate: json['issueDate'] ?? DateTime.now().toIso8601String().substring(0, 10),
      expiryDate: json['expiryDate'] ?? DateTime.now().add(const Duration(days: 365)).toIso8601String().substring(0, 10),
      status: json['status'] ?? 'Valid',
      fileUrl: json['fileUrl'],
      organizationId: json['organizationId'] ?? 'org_01',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'vehicleId': vehicleId,
      'documentType': documentType,
      'documentNumber': documentNumber,
      'issueDate': issueDate,
      'expiryDate': expiryDate,
      'status': status,
      'fileUrl': fileUrl,
      'organizationId': organizationId,
    };
  }
}

class NotificationModel {
  final String id;
  final String title;
  final String message;
  final String type; // 'urgent', 'warning', 'info', 'success'
  final String timestamp;
  final bool isRead;
  final Map<String, dynamic>? linkTo;

  NotificationModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    required this.timestamp,
    this.isRead = false,
    this.linkTo,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json, String id) {
    return NotificationModel(
      id: id,
      title: json['title'] ?? '',
      message: json['message'] ?? '',
      type: json['type'] ?? 'info',
      timestamp: json['timestamp'] ?? 'Just now',
      isRead: json['isRead'] ?? false,
      linkTo: json['linkTo'] != null ? Map<String, dynamic>.from(json['linkTo']) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'title': title,
      'message': message,
      'type': type,
      'timestamp': timestamp,
      'isRead': isRead,
      'linkTo': linkTo,
    };
  }
}
