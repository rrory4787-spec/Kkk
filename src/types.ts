export interface GlobalConfig {
  whatsapp: string;
  lawyerAr: string;
  lawyerEn: string;
  location: string;
  logoUrl?: string;
  updatedAt: any;
}

export interface InvestmentPackage {
  id: string;
  badgeAr: string;
  badgeEn: string;
  descAr: string;
  descEn: string;
  introAr: string;
  introEn: string;
  f1TitleAr: string;
  f1TitleEn: string;
  f1TextAr: string;
  f1TextEn: string;
  f2TitleAr: string;
  f2TitleEn: string;
  f2TextAr: string;
  f2TextEn: string;
  f2IconClass?: string;
  tr1ValueAr: string;
  tr1ValueEn: string;
  tr2ValueAr: string;
  tr2ValueEn: string;
  tr3ValueAr: string;
  tr3ValueEn: string;
  tr4ValueAr: string;
  tr4ValueEn: string;
  showCustodyRow: boolean;
  updatedAt: any;
}

export type PackageType = 'smart' | 'advanced' | 'vip';
