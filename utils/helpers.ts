
export const generateHealthId = () => `${Math.floor(1000000000 + Math.random() * 9000000000)}`;

export const calculateAge = (dob: string): number => {
  const birthDate = new Date(dob);
  const difference = Date.now() - birthDate.getTime();
  const ageDate = new Date(difference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};
