import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

describe('<HomeScreen />', () => {
  test('Text renders correctly on HomeScreen', () => {
    render(<Text>Hello World</Text>);
    expect(screen.getByText('Hello World')).toBeDefined();
  });
});
