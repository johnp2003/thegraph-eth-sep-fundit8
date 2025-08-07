import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  CharityCentral,
  CharityVerified,
  CampaignCreated,
} from '../generated/CharityCentral/CharityCentral';
import { CharityCampaign as CharityCampaignTemplate } from '../generated/templates';
import { Charity, Campaign } from '../generated/schema';

export function handleCharityVerified(event: CharityVerified): void {
  let charityId = event.params.charityAddress.toHexString();
  let charity = Charity.load(charityId);

  if (!charity) {
    charity = new Charity(charityId);
    charity.address = event.params.charityAddress;
    charity.name = event.params.name;
    charity.isVerified = true;
    charity.save();
  } else {
    charity.name = event.params.name;
    charity.isVerified = true;
    charity.save();
  }
}

export function handleCampaignCreated(event: CampaignCreated): void {
  let campaignId = event.params.campaignAddress.toHexString();
  let charityId = event.params.charityAddress.toHexString();

  // Make sure charity exists
  let charity = Charity.load(charityId);
  if (!charity) {
    charity = new Charity(charityId);
    charity.address = event.params.charityAddress;
    charity.name = 'Unknown Charity'; // Default name
    charity.isVerified = true; // Must be verified to create campaign
    charity.save();
  }

  // Create campaign entity
  let campaign = new Campaign(campaignId);
  campaign.address = event.params.campaignAddress;
  campaign.charity = charityId;
  campaign.name = event.params.name;
  campaign.description = ''; // Will be updated when we fetch campaign details
  campaign.goal = event.params.goal;
  campaign.totalDonated = BigInt.fromI32(0);
  campaign.state = 'Active';
  campaign.topDonors = [];
  campaign.createdAt = event.block.timestamp;
  campaign.donorsCount = 0;
  campaign.save();

  // Start tracking the new campaign contract
  CharityCampaignTemplate.create(event.params.campaignAddress);
}
