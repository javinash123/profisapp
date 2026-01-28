export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Onboarding: undefined;
  MatchSetup: undefined;
  LiveMatch: undefined;
  EndMatchSummary: { matchData?: any } | undefined;
  AlarmManagement: undefined;
  AddEditAlarm: { alarmId?: string };
  WeatherDetails: undefined;
  Settings: undefined;
  ManualWeightEdit: { netIndex: number };
  MatchHistory: undefined;
  MatchSummary: { matchData: any };
};
