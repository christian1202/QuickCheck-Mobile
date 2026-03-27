// Navigation type definitions
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Main: undefined;
  QuickMark: { eventId: string };
  AddEditMember: { memberId?: string } | undefined;
  CreateEvent: undefined;
  MemberReport: { memberId: string };
  AbsenceReport: { memberId: string; eventId: string } | undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Members: undefined;
  Events: undefined;
  Calendar: undefined;
  Reports: undefined;
};
