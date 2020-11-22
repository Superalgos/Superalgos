export const toLocalTime = (epoch) => {
  const localDate = new Date(0);
  localDate.setUTCSeconds(epoch);
  const options = { year: 'numeric', month: 'long', day: '2-digit' };
  return (
    `${localDate.toLocaleDateString(options)
    } at ${
      localDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
  );
};

export const temporaryFunction = input => input;
