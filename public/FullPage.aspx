<%@ Page Language="C#" Inherits="Microsoft.SharePoint.Publishing.PublishingLayoutPage,Microsoft.SharePoint.Publishing,Version=15.0.0.0,Culture=neutral,PublicKeyToken=71e9bce111e9429c" meta:progid="SharePoint.WebPartPage.Document" %>

<%@ Register TagPrefix="SharePointWebControls" Namespace="Microsoft.SharePoint.WebControls" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="WebPartPages" Namespace="Microsoft.SharePoint.WebPartPages" Assembly="Microsoft.SharePoint, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="PublishingWebControls" Namespace="Microsoft.SharePoint.Publishing.WebControls" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="PublishingNavigation" Namespace="Microsoft.SharePoint.Publishing.Navigation" Assembly="Microsoft.SharePoint.Publishing, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<%@ Register TagPrefix="SPSWC" Namespace="Microsoft.SharePoint.Portal.WebControls" Assembly="Microsoft.SharePoint.Portal, Version=15.0.0.0, Culture=neutral, PublicKeyToken=71e9bce111e9429c" %>
<asp:Content contentplaceholderid="PlaceHolderAdditionalPageHead" runat="server">
	<SharePointWebControls:CssRegistration
		name="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/pagelayouts15.css %>"
		runat="server" />
	<PublishingWebControls:EditModePanel PageDisplayMode="Edit" runat="server">
		<SharePointWebControls:CssRegistration
			name="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/editmode15.css %>"
			After="<% $SPUrl:~sitecollection/Style Library/~language/Themable/Core Styles/pagelayouts15.css %>"
			runat="server" />
			<style type="text/css">
				#app, #LoadingBars { display: none; }
			</style>
	</PublishingWebControls:EditModePanel>
	<SharePointWebControls:FieldValue id="PageStylesField" FieldName="HeaderStyleDefinitions" runat="server" />
	<PublishingWebControls:EditModePanel PageDisplayMode="Display" runat="server">
		<style type="text/css">
			a[href*="manning"] { display: none }
			#s4-ribbonrow, #sideNavBox, #suiteBar, #titleAreaBox { display: none; }
			#LoadingBars{
				position:relative;
				width:240px;
				height:298px;
				margin:auto;
			}

			.blockG{
				position:absolute;
				background-color:rgba(255,255,255,0.69);
				width:39px;
				height:93px;
				border-radius:31px 31px 0 0;
					-o-border-radius:31px 31px 0 0;
					-ms-border-radius:31px 31px 0 0;
					-webkit-border-radius:31px 31px 0 0;
					-moz-border-radius:31px 31px 0 0;
				transform:scale(0.4);
					-o-transform:scale(0.4);
					-ms-transform:scale(0.4);
					-webkit-transform:scale(0.4);
					-moz-transform:scale(0.4);
				animation-name:fadeG;
					-o-animation-name:fadeG;
					-ms-animation-name:fadeG;
					-webkit-animation-name:fadeG;
					-moz-animation-name:fadeG;
				animation-duration:0.732s;
					-o-animation-duration:0.732s;
					-ms-animation-duration:0.732s;
					-webkit-animation-duration:0.732s;
					-moz-animation-duration:0.732s;
				animation-iteration-count:infinite;
					-o-animation-iteration-count:infinite;
					-ms-animation-iteration-count:infinite;
					-webkit-animation-iteration-count:infinite;
					-moz-animation-iteration-count:infinite;
				animation-direction:normal;
					-o-animation-direction:normal;
					-ms-animation-direction:normal;
					-webkit-animation-direction:normal;
					-moz-animation-direction:normal;
			}

			#rotateG_01{
				left:0;
				top:109px;
				animation-delay:0.2695s;
					-o-animation-delay:0.2695s;
					-ms-animation-delay:0.2695s;
					-webkit-animation-delay:0.2695s;
					-moz-animation-delay:0.2695s;
				transform:rotate(-90deg);
					-o-transform:rotate(-90deg);
					-ms-transform:rotate(-90deg);
					-webkit-transform:rotate(-90deg);
					-moz-transform:rotate(-90deg);
			}

			#rotateG_02{
				left:31px;
				top:39px;
				animation-delay:0.366s;
					-o-animation-delay:0.366s;
					-ms-animation-delay:0.366s;
					-webkit-animation-delay:0.366s;
					-moz-animation-delay:0.366s;
				transform:rotate(-45deg);
					-o-transform:rotate(-45deg);
					-ms-transform:rotate(-45deg);
					-webkit-transform:rotate(-45deg);
					-moz-transform:rotate(-45deg);
			}

			#rotateG_03{
				left:101px;
				top:12px;
				animation-delay:0.4525s;
					-o-animation-delay:0.4525s;
					-ms-animation-delay:0.4525s;
					-webkit-animation-delay:0.4525s;
					-moz-animation-delay:0.4525s;
				transform:rotate(0deg);
					-o-transform:rotate(0deg);
					-ms-transform:rotate(0deg);
					-webkit-transform:rotate(0deg);
					-moz-transform:rotate(0deg);
			}

			#rotateG_04{
				right:31px;
				top:39px;
				animation-delay:0.549s;
					-o-animation-delay:0.549s;
					-ms-animation-delay:0.549s;
					-webkit-animation-delay:0.549s;
					-moz-animation-delay:0.549s;
				transform:rotate(45deg);
					-o-transform:rotate(45deg);
					-ms-transform:rotate(45deg);
					-webkit-transform:rotate(45deg);
					-moz-transform:rotate(45deg);
			}

			#rotateG_05{
				right:0;
				top:109px;
				animation-delay:0.6355s;
					-o-animation-delay:0.6355s;
					-ms-animation-delay:0.6355s;
					-webkit-animation-delay:0.6355s;
					-moz-animation-delay:0.6355s;
				transform:rotate(90deg);
					-o-transform:rotate(90deg);
					-ms-transform:rotate(90deg);
					-webkit-transform:rotate(90deg);
					-moz-transform:rotate(90deg);
			}

			#rotateG_06{
				right:31px;
				bottom:27px;
				animation-delay:0.732s;
					-o-animation-delay:0.732s;
					-ms-animation-delay:0.732s;
					-webkit-animation-delay:0.732s;
					-moz-animation-delay:0.732s;
				transform:rotate(135deg);
					-o-transform:rotate(135deg);
					-ms-transform:rotate(135deg);
					-webkit-transform:rotate(135deg);
					-moz-transform:rotate(135deg);
			}

			#rotateG_07{
				bottom:0;
				left:101px;
				animation-delay:0.8185s;
					-o-animation-delay:0.8185s;
					-ms-animation-delay:0.8185s;
					-webkit-animation-delay:0.8185s;
					-moz-animation-delay:0.8185s;
				transform:rotate(180deg);
					-o-transform:rotate(180deg);
					-ms-transform:rotate(180deg);
					-webkit-transform:rotate(180deg);
					-moz-transform:rotate(180deg);
			}

			#rotateG_08{
				left:31px;
				bottom:27px;
				animation-delay:0.905s;
					-o-animation-delay:0.905s;
					-ms-animation-delay:0.905s;
					-webkit-animation-delay:0.905s;
					-moz-animation-delay:0.905s;
				transform:rotate(-135deg);
					-o-transform:rotate(-135deg);
					-ms-transform:rotate(-135deg);
					-webkit-transform:rotate(-135deg);
					-moz-transform:rotate(-135deg);
			}

			@keyframes fadeG{
				0%{
					background-color:rgb(255,0,0);
				}

				100%{
					background-color:rgb(255,255,255);
				}
			}

			@-o-keyframes fadeG{
				0%{
					background-color:rgb(255,0,0);
				}

				100%{
					background-color:rgb(255,255,255);
				}
			}

			@-ms-keyframes fadeG{
				0%{
					background-color:rgb(255,0,0);
				}

				100%{
					background-color:rgb(255,255,255);
				}
			}

			@-webkit-keyframes fadeG{
				0%{
					background-color:rgb(255,0,0);
				}

				100%{
					background-color:rgb(255,255,255);
				}
			}

			@-moz-keyframes fadeG{
				0%{
					background-color:rgb(255,0,0);
				}

				100%{
					background-color:rgb(255,255,255);
				}
			}
		</style>
	</PublishingWebControls:EditModePanel>

</asp:Content>

<asp:Content contentplaceholderid="PlaceHolderPageTitle" runat="server">
	<SharePointWebControls:FieldValue FieldName="Title" runat="server" />
</asp:Content>

<asp:Content contentplaceholderid="PlaceHolderMain" runat="server">
	<div id="LoadingBars">
		<div class="blockG" id="rotateG_01"></div>
		<div class="blockG" id="rotateG_02"></div>
		<div class="blockG" id="rotateG_03"></div>
		<div class="blockG" id="rotateG_04"></div>
		<div class="blockG" id="rotateG_05"></div>
		<div class="blockG" id="rotateG_06"></div>
		<div class="blockG" id="rotateG_07"></div>
		<div class="blockG" id="rotateG_08"></div>
	</div>
	<div id="MainContent">
		<div class="row">
			<WebPartPages:WebPartZone runat="server" Title="Main" ID="WPZMain">
				<ZoneTemplate></ZoneTemplate>
			</WebPartPages:WebPartZone>
		</div>
	</div>
</asp:Content>