$(function() {
    $("#register").validate({
        rules : {
            password : {
                minlength : 5,
		required:true
            },
            password_confirm : {
		required:true,
                minlength : 5,
                equalTo : "#p1"
            }
        },
	messages: {
	    email: {
		required: "We need your email address to contact you",
	    },
	    username: {
		required: "Choose a username"
	    },
	    password: {
		minlength: $.format("Your password must have at least {0} characters")
	    },
	    password_confirm: {
		minlength: $.format("Your password must have at least {0} characters"),
		equalTo:"Please make sure both passwords match"
	    }

	}
    });
});