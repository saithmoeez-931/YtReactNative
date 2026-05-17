import React, { useState } from 'react';
import { TextInput } from 'react-native-paper';
import FormInput from './FormInput';

export default function PasswordInput(props) {
  const [visible, setVisible] = useState(false);

  return (
    <FormInput
      {...props}
      right={
        <TextInput.Icon
          icon={visible ? 'eye-off-outline' : 'eye-outline'}
          onPress={() => setVisible(current => !current)}
        />
      }
      secureTextEntry={!visible}
    />
  );
}
