const Login = React.createClass({
    componentDidMount() {
        ////////////____Input Focus___//////////////////

        $('.login-form-control').focusout(function() {
            $('.login-form-group').removeClass('focus');
        });
        $('.login-form-control').focus(function() {
            $(this).closest('.form-group').addClass('focus');
        });

        /// Input Kepress Filled  Focus
        $('.login-form-control').keyup(function() {
            if($(this).val().length > 0){
                $(this).closest('.login-form-group').addClass('filled');
            }

            else{
                $(this).closest('.login-form-group').removeClass('filled');
            }
        });

        /// Input Check Filled Focus
        var $formControl = $('.login-form-control');
        var values = {};
        var validate =    $formControl.each(function() {
            if($(this).val().length > 0){
                $(this).closest('.login-form-group').addClass('filled');
            }
            else{
                $(this).closest('.login-form-group').removeClass('filled');
            }
        });



        $('.close').click(function(){
            $(this).closest('.register-form').toggleClass('open');
        });
    },

    render() {
        return (
            <div className="login-panel">
                <h2>LOGIN</h2>
                <div className="login-formset">
                    <div className="login-form-group">
                        <lable className="login-form-label">User Name</lable>
                        <input type="text" className="login-form-control"/>
                    </div>
                    <div className="login-form-group">
                        <lable className="login-form-label">Password</lable>
                        <input type="password" className="login-form-control"/>
                    </div>
                    <button className="login-btn">Log in</button><a href="#">Forgot Your Password?</a>
                </div>
                <form className="register-form"><i className="close">&times;</i>
                    <h2>REGISTER</h2>
                    <div className="login-formset">
                        <div className="login-form-group">
                            <lable className="login-form-label">User Name</lable>
                            <input type="text" className="login-form-control"/>
                        </div>
                        <div className="login-form-group">
                            <lable className="login-form-label">Email</lable>
                            <input type="text" className="login-form-control"/>
                        </div>
                        <div className="login-form-group">
                            <lable className="login-form-label">Password</lable>
                            <input type="password" className="login-form-control"/>
                        </div>
                        <div className="login-form-group">
                            <lable className="login-form-label">Repeat Password</lable>
                            <input type="password" className="login-form-control"/>
                        </div>
                        <button className="login-btn">Log in</button>
                    </div>
                </form>
            </div>
        )
    }
});

export default React;