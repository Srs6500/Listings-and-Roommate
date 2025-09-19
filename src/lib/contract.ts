import { ethers } from 'ethers';
import contractInfo from './contract-info.json';

export interface RentalAgreement {
  id: number;
  tenant: string;
  landlord: string;
  monthlyRent: string;
  securityDeposit: string;
  startDate: number;
  endDate: number;
  isActive: boolean;
  securityDepositReturned: boolean;
}

export interface Property {
  id: number;
  owner: string;
  title: string;
  location: string;
  monthlyRent: string;
  securityDeposit: string;
  isAvailable: boolean;
  ipfsHash: string;
}

class ContractService {
  private contract: ethers.Contract | null = null;
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.ethereum) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
    }
  }

  async initialize(signer: ethers.JsonRpcSigner) {
    this.signer = signer;
    this.contract = new ethers.Contract(
      contractInfo.address,
      contractInfo.abi,
      signer
    );
  }

  // Property Management
  async listProperty(
    title: string,
    location: string,
    monthlyRent: string,
    securityDeposit: string,
    ipfsHash: string
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.listProperty(
      title,
      location,
      ethers.parseEther(monthlyRent),
      ethers.parseEther(securityDeposit),
      ipfsHash
    );
    
    return await tx.wait();
  }

  async getProperty(propertyId: number): Promise<Property> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const property = await this.contract.properties(propertyId);
    return {
      id: Number(property.id),
      owner: property.owner,
      title: property.title,
      location: property.location,
      monthlyRent: ethers.formatEther(property.monthlyRent),
      securityDeposit: ethers.formatEther(property.securityDeposit),
      isAvailable: property.isAvailable,
      ipfsHash: property.ipfsHash,
    };
  }

  // Rental Agreement Management
  async createRentalAgreement(
    propertyId: number,
    tenant: string,
    startDate: number,
    endDate: number,
    securityDeposit: string
  ) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.createRentalAgreement(
      propertyId,
      tenant,
      startDate,
      endDate,
      { value: ethers.parseEther(securityDeposit) }
    );
    
    return await tx.wait();
  }

  async getRentalAgreement(rentalId: number): Promise<RentalAgreement> {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const agreement = await this.contract.getRentalAgreement(rentalId);
    return {
      id: Number(agreement.id),
      tenant: agreement.tenant,
      landlord: agreement.landlord,
      monthlyRent: ethers.formatEther(agreement.monthlyRent),
      securityDeposit: ethers.formatEther(agreement.securityDeposit),
      startDate: Number(agreement.startDate),
      endDate: Number(agreement.endDate),
      isActive: agreement.isActive,
      securityDepositReturned: agreement.securityDepositReturned,
    };
  }

  async payRent(rentalId: number, month: number, amount: string) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.payRent(rentalId, month, {
      value: ethers.parseEther(amount)
    });
    
    return await tx.wait();
  }

  async isRentPaid(rentalId: number, month: number): Promise<boolean> {
    if (!this.contract) throw new Error('Contract not initialized');
    return await this.contract.isRentPaid(rentalId, month);
  }

  async endRentalAgreement(rentalId: number) {
    if (!this.contract) throw new Error('Contract not initialized');
    
    const tx = await this.contract.endRentalAgreement(rentalId);
    return await tx.wait();
  }

  // Get user's data
  async getTenantRentals(tenantAddress: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    const rentals = await this.contract.getTenantRentals(tenantAddress);
    return rentals.map((id: any) => Number(id));
  }

  async getLandlordProperties(landlordAddress: string): Promise<number[]> {
    if (!this.contract) throw new Error('Contract not initialized');
    const properties = await this.contract.getLandlordProperties(landlordAddress);
    return properties.map((id: any) => Number(id));
  }

  // Utility functions
  async getContractBalance(): Promise<string> {
    if (!this.provider || !this.contract) throw new Error('Provider or contract not initialized');
    const balance = await this.provider.getBalance(await this.contract.getAddress());
    return ethers.formatEther(balance);
  }

  async getCurrentBlockTimestamp(): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    const block = await this.provider.getBlock('latest');
    return block?.timestamp || 0;
  }
}

export const contractService = new ContractService();
