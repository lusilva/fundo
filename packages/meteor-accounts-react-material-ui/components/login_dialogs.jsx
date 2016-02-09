Accounts.ui.Dialogs = React.createClass({
  mixins: [ReactMeteorData],

  getMeteorData(){
    const resetPasswordToken = Meteor.isClient ? Accounts._loginButtonsSession.get('resetPasswordToken') : undefined;

    return {resetPasswordToken};
  },

  getInitialState(){
    return({
      message: '',
      updateDisabled: true,
      dialogOpen: false
    });
  },

  componentWillUpdate(){
    this.show(this.data.resetPasswordToken);
  },

  show(resetPasswordToken){
    if (this.isMounted() && !this.state.dialogOpen && resetPasswordToken){
      this.setState({
        dialogOpen: true
      });
    }
  },

  componentDidMount(){
    this.show(this.data.resetPasswordToken);
  },

  validatePassword(password){
    return validatePassword(password);
  },

  resetPassword() {
    const newPassword = this.refs.newPassword.getValue();

    if (!this.validatePassword(newPassword)){
      this.showMessage(t9n("error.pwTooShort"));

      return;
    }

    Accounts.resetPassword(
      this.data.resetPasswordToken,
      newPassword,
      (error)=>{
        if (error) {
          this.showMessage(t9n(`error.accounts.${error.reason}`) || t9n("Unknown error"));
        } else {
          this.showMessage(t9n('info.passwordChanged'));
          this.cancel();
        }
      }
    );
  },

  showMessage(message){
    message = message.trim();

    if (message){
      this.setState({message});
    }
  },

  cancel(){
    Accounts._loginButtonsSession.set('resetPasswordToken', null);

    this.setState({
      dialogOpen: false
    });
  },

  updateDisabled() {
    if (this.state.dialogOpen){
      this.setState({updateDisabled: this.refs.newPassword.getValue() === ''});
    }
  },

  render(){

    const actions = [
      <MUI.FlatButton
        label={t9n('cancel')}
        onTouchTap={this.cancel}
      />,
      <MUI.FlatButton
        label={t9n('changePassword')}
        secondary={true}
        onTouchTap={this.resetPassword}
        disabled={this.state.updateDisabled}
      />
    ];


    return(<div className="accounts-ui__dialogs">
      <MUI.Dialog
        title={t9n('changePassword')}
        actions={actions}
        autoDetectWindowHeight={true}
        autoScrollBodyContent={true}
        open={this.state.dialogOpen}>
          <div className="accounts-ui__field">
            <MUI.TextField
              key="newPassword"
              ref="newPassword"
              type="password"
              floatingLabelText={t9n('newPassword')}
              errorText={this.state.message}
              onChange={this.updateDisabled}/>
          </div>
      </MUI.Dialog>
    </div>);
  }
});
