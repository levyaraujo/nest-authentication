export interface UserProps {
  name: string;
  email: string;
  password: string;
  secretToken?: string;
}

export class User {
  public props: UserProps;

  constructor(props: UserProps) {
    this.props = props;
  }

  updateName(name: string) {
    this.props.name = name;
  }

  updateEmail(email: string) {
    this.props.email = email;
  }

  updatePassword(password: string) {
    this.props.password = password;
  }

  createSecretToken(secretToken: string) {
    this.props.secretToken = secretToken;
  }

  toJSON() {
    return {
      name: this.name,
      email: this.email,
    };
  }

  get name() {
    return this.props.name;
  }

  get email() {
    return this.props.email;
  }

  get secretToken() {
    return this.props.secretToken;
  }
}
