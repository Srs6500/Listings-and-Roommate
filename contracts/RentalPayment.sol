// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract RentalPayment is ReentrancyGuard, Ownable, Pausable {
    struct RentalAgreement {
        uint256 id;
        address tenant;
        address landlord;
        uint256 monthlyRent;
        uint256 securityDeposit;
        uint256 startDate;
        uint256 endDate;
        bool isActive;
        bool securityDepositReturned;
        mapping(uint256 => bool) rentPaid;
    }

    struct Property {
        uint256 id;
        address owner;
        string title;
        string location;
        uint256 monthlyRent;
        uint256 securityDeposit;
        bool isAvailable;
        string ipfsHash; // For storing property documents
    }

    mapping(uint256 => RentalAgreement) public rentalAgreements;
    mapping(uint256 => Property) public properties;
    mapping(address => uint256[]) public tenantRentals;
    mapping(address => uint256[]) public landlordProperties;
    
    uint256 public nextRentalId = 1;
    uint256 public nextPropertyId = 1;
    
    event PropertyListed(uint256 indexed propertyId, address indexed owner, string title, uint256 monthlyRent);
    event RentalAgreementCreated(uint256 indexed rentalId, address indexed tenant, address indexed landlord, uint256 monthlyRent);
    event RentPaid(uint256 indexed rentalId, uint256 month, uint256 amount);
    event SecurityDepositPaid(uint256 indexed rentalId, uint256 amount);
    event SecurityDepositReturned(uint256 indexed rentalId, uint256 amount);
    event RentalAgreementEnded(uint256 indexed rentalId);

    constructor() {}

    // List a new property
    function listProperty(
        string memory _title,
        string memory _location,
        uint256 _monthlyRent,
        uint256 _securityDeposit,
        string memory _ipfsHash
    ) external whenNotPaused {
        uint256 propertyId = nextPropertyId++;
        
        Property storage property = properties[propertyId];
        property.id = propertyId;
        property.owner = msg.sender;
        property.title = _title;
        property.location = _location;
        property.monthlyRent = _monthlyRent;
        property.securityDeposit = _securityDeposit;
        property.isAvailable = true;
        property.ipfsHash = _ipfsHash;
        
        landlordProperties[msg.sender].push(propertyId);
        
        emit PropertyListed(propertyId, msg.sender, _title, _monthlyRent);
    }

    // Create a rental agreement
    function createRentalAgreement(
        uint256 _propertyId,
        address _tenant,
        uint256 _startDate,
        uint256 _endDate
    ) external payable whenNotPaused nonReentrant {
        Property storage property = properties[_propertyId];
        require(property.owner == msg.sender, "Only property owner can create rental agreement");
        require(property.isAvailable, "Property not available");
        require(_tenant != address(0), "Invalid tenant address");
        require(_startDate < _endDate, "Invalid date range");
        require(msg.value >= property.securityDeposit, "Insufficient security deposit");

        uint256 rentalId = nextRentalId++;
        
        RentalAgreement storage agreement = rentalAgreements[rentalId];
        agreement.id = rentalId;
        agreement.tenant = _tenant;
        agreement.landlord = msg.sender;
        agreement.monthlyRent = property.monthlyRent;
        agreement.securityDeposit = property.securityDeposit;
        agreement.startDate = _startDate;
        agreement.endDate = _endDate;
        agreement.isActive = true;
        agreement.securityDepositReturned = false;

        property.isAvailable = false;
        tenantRentals[_tenant].push(rentalId);

        emit RentalAgreementCreated(rentalId, _tenant, msg.sender, property.monthlyRent);
        emit SecurityDepositPaid(rentalId, property.securityDeposit);
    }

    // Pay monthly rent
    function payRent(uint256 _rentalId, uint256 _month) external payable whenNotPaused nonReentrant {
        RentalAgreement storage agreement = rentalAgreements[_rentalId];
        require(agreement.tenant == msg.sender, "Only tenant can pay rent");
        require(agreement.isActive, "Rental agreement not active");
        require(!agreement.rentPaid[_month], "Rent already paid for this month");
        require(msg.value >= agreement.monthlyRent, "Insufficient rent payment");

        agreement.rentPaid[_month] = true;
        
        // Transfer rent to landlord
        payable(agreement.landlord).transfer(agreement.monthlyRent);
        
        // Refund excess payment
        if (msg.value > agreement.monthlyRent) {
            payable(msg.sender).transfer(msg.value - agreement.monthlyRent);
        }

        emit RentPaid(_rentalId, _month, agreement.monthlyRent);
    }

    // End rental agreement and return security deposit
    function endRentalAgreement(uint256 _rentalId) external whenNotPaused nonReentrant {
        RentalAgreement storage agreement = rentalAgreements[_rentalId];
        require(
            agreement.landlord == msg.sender || agreement.tenant == msg.sender,
            "Only landlord or tenant can end agreement"
        );
        require(agreement.isActive, "Rental agreement not active");
        require(block.timestamp >= agreement.endDate, "Rental period not ended");

        agreement.isActive = false;
        
        // Return security deposit to tenant
        if (!agreement.securityDepositReturned) {
            agreement.securityDepositReturned = true;
            payable(agreement.tenant).transfer(agreement.securityDeposit);
            emit SecurityDepositReturned(_rentalId, agreement.securityDeposit);
        }

        // Make property available again
        for (uint256 i = 1; i < nextPropertyId; i++) {
            if (properties[i].owner == agreement.landlord) {
                properties[i].isAvailable = true;
                break;
            }
        }

        emit RentalAgreementEnded(_rentalId);
    }

    // Get rental agreement details
    function getRentalAgreement(uint256 _rentalId) external view returns (
        uint256 id,
        address tenant,
        address landlord,
        uint256 monthlyRent,
        uint256 securityDeposit,
        uint256 startDate,
        uint256 endDate,
        bool isActive,
        bool securityDepositReturned
    ) {
        RentalAgreement storage agreement = rentalAgreements[_rentalId];
        return (
            agreement.id,
            agreement.tenant,
            agreement.landlord,
            agreement.monthlyRent,
            agreement.securityDeposit,
            agreement.startDate,
            agreement.endDate,
            agreement.isActive,
            agreement.securityDepositReturned
        );
    }

    // Check if rent is paid for a specific month
    function isRentPaid(uint256 _rentalId, uint256 _month) external view returns (bool) {
        return rentalAgreements[_rentalId].rentPaid[_month];
    }

    // Get tenant's rental history
    function getTenantRentals(address _tenant) external view returns (uint256[] memory) {
        return tenantRentals[_tenant];
    }

    // Get landlord's properties
    function getLandlordProperties(address _landlord) external view returns (uint256[] memory) {
        return landlordProperties[_landlord];
    }

    // Emergency functions
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Withdraw contract balance (emergency only)
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    // Receive function to accept ETH
    receive() external payable {}
}
