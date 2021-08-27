const logoText = document.querySelector("#logo-text");
const searchDiv = document.querySelector("#search-div");
const form = document.querySelector("#search-form");
const suggestions = document.querySelector("#search-suggestions");
const resultsCont = document.querySelector("#results-container");
const actorResult = document.querySelector("#actor-result");
const actorName = document.querySelector("#actor-name");
const actorPhoto = document.querySelector("#actor-photo");
const showsCont = document.querySelector("#shows-container");
const coStarsContainer = document.querySelector("#fellow-cast-inner-container");

let typedQuery = form.elements.query.value;
let sugsOn = false;
let sugSelected = -1;
let actorId = false;
let showId = false;
let castShowing = false;
let prevShowDiv = null;
let offsetAmount = 2;

const clearContent = () => {
  actorPhoto.src = "";
  actorPhoto.alt = "";
  actorName.innerText = "";
  showId = "";
  clearCostars();
  while (showsCont.firstChild) {
    showsCont.removeChild(showsCont.firstChild);
  }
};

const clearCostars = () => {
  castShowing = false;
  while (coStarsContainer.firstChild) {
    coStarsContainer.removeChild(coStarsContainer.firstChild);
  }
  coStarsContainer.style.opacity = "0";
};

const clearSuggestions = () => {
  while (searchDiv.children[1].firstChild) {
    searchDiv.children[1].removeChild(searchDiv.children[1].firstChild);
  }
  suggestions.style.border = "";
  sugsOn = false;
  sugSelected = -1;
};

const searchName = async function (searchTerm) {
  const config = { params: { q: searchTerm } };
  const searchRes = await axios.get(
    `https://api.tvmaze.com/search/people`,
    config
  );
  form.elements.query.value = "";
  clearSuggestions();
  if (searchRes.data[0]) {
    actorId = searchRes.data[0].person.id;
    getActorInfo(actorId);
    clearContent();
    form.classList.remove("init");
    form.classList.add("search-used");
    suggestions.classList.remove("init-suggestions");
    suggestions.classList.add("sugs-used");
    resultsCont.style.display = "inline";
  } else {
    alert("Actor not found.");
  }
};

const getActorInfo = async (actorId) => {
  try {
    const profileRes = await axios.get(
      `https://api.tvmaze.com/people/${actorId}`
    );
    const actorNameResult = profileRes.data.name;
    if (profileRes.data.image) {
      actorPhoto.src = profileRes.data.image.medium;
      actorPhoto.alt = `Photo of ${actorNameResult}`;
    } else {
      actorPhoto.src =
      	"https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png"
    }
    actorName.innerText = actorNameResult;
  } catch (e) {
    console.log(e);
  }
};

const getTopShows = async (actorId) => {
  if (showsCont.childElementCount > 0) {
  	coStarsContainer.style.top = '0';
    while (coStarsContainer.firstChild) {
      coStarsContainer.removeChild(coStarsContainer.firstChild);
    }
    while (showsCont.firstChild) {
      showsCont.removeChild(showsCont.firstChild);
    }
  } else {
    try {
      const castCredRes = await axios.get(
        `https://api.tvmaze.com/people/${actorId}/castcredits?embed=show`
      );
      for (let shows of castCredRes.data) {
        if (castCredRes.data.indexOf(shows) < 3) {
	  if (castCredRes.data.indexOf(shows) > 1) {
		  showsCont.style.justifyContent = 'space-evenly'
	  }
          const showDiv = document.createElement("DIV");
          const showTitle = document.createElement("H2");
          const showImg = document.createElement("IMG");
          const ratingStars = document.createElement("P");
          const showSummary = document.createElement("P");
          const mobileCastSpacer = document.createElement("DIV");
	  mobileCastSpacer.classList.add('show-spacer');
          showsCont.append(showDiv);
          showsCont.append(mobileCastSpacer);
          showDiv.append(showTitle);
          showDiv.append(showImg);
          if (shows._embedded.show.rating.average != null) {
            showDiv.append(ratingStars);
          };
          showDiv.append(showSummary);
          showDiv.classList.add("show-info", "results-div");
          showTitle.classList.add("show-title");
          showImg.classList.add("show-img");
          ratingStars.classList.add("rating-stars");
          showSummary.classList.add("show-blurb");
          showDiv.id = shows._embedded.show.id;
          showTitle.innerText = shows._embedded.show.name; 
          for (let stars of Array(
            Math.round(shows._embedded.show.rating.average / 2)
          )) {
            ratingStars.innerText += String.fromCodePoint(0x2b50);
          }
          if (shows._embedded.show.image) {
            showImg.src = shows._embedded.show.image.medium;
          } else {
            showImg.src =
              "https://resize.hswstatic.com/w_250/gif/retro-tvl-250x150.jpg";
          }
          showImg.alt = `Cover art for ${shows._embedded.show.name}`;
          if (shows._embedded.show.summary.length && shows._embedded.show.summary.length > 250) {
            showSummary.innerText = shows._embedded.show.summary
              .substring(0, shows._embedded.show.summary.indexOf(".", 200) + 1)
              .replace(/(<([^>]+)>)/gi, "");
          } else if (shows._embedded.show.summary.length) {
            showSummary.innerText = shows._embedded.show.summary.replace(
              /(<([^>]+)>)/gi,
              ""
            );
          } else {
          	showSummary.innerText = "No show summary available."
          }
          showDiv.addEventListener("mousedown", function (e) {
          	const thisDiv = e.composedPath()[0].offsetTop;
          	if (e.which == 1) {
	          	for (let hiddenDivs of showsCont.children) {
		        	if (!hiddenDivs.children.length) {
		            	hiddenDivs.style.height = '0';
		            	hiddenDivs.previousElementSibling.style.marginTop = '0';
		             };
		        };
	            if (showDiv.id == showId) {
	              clearCostars();
	              scrollToElement(this);
	              showId = ""; 
				  this.nextElementSibling.style.height = '0';
				  if (this.nextElementSibling.nextElementSibling) {
				  	this.nextElementSibling.nextElementSibling.style.marginTop = '0';
				  };
	            } else {
				  this.nextElementSibling.style.height = '154px';
				  if (this.nextElementSibling.nextElementSibling) {
				  	this.nextElementSibling.nextElementSibling.style.marginTop = '10px';
				  };
				  coStarsContainer.style.marginTop = '25px';
	              coStarsContainer.style.position = "absolute";
	              if (castShowing && prevShowDiv < thisDiv) {
	              	offsetAmount = -154;
	              } else if (castShowing && prevShowDiv > thisDiv) {
	              	offsetAmount = 2;
	              } else {
	              	offsetAmount = 2;
	              }
		          clearCostars();
		          getTopCast(showDiv.id);
	              coStarsContainer.style.top = (this.offsetTop + this.offsetHeight + offsetAmount) + "px";
	              showId = showDiv.id;
	              prevShowDiv = thisDiv;
	            }
          	};
          });
          showDiv.addEventListener("mouseup", function (e) {
          	if (e.which == 1) {
	            if (showDiv.id == showId) {
	            	const pixelsOffScreen = 175 - (window.innerHeight - this.scrollHeight);
	              scrollToElement(this, pixelsOffScreen);
	            };
          	};
          });
        };
      };
    } catch (e) {
      console.log(e);
    }
  }
};

const scrollToElement = (element, offsetBy) => {
	setTimeout(function () {
		let amount = 0
		if (offsetBy) amount = offsetBy;
		scrollTo(0, (element.offsetTop + amount));
	}, 65);
};

const getTopCast = async (showId) => {
  castShowing = true;
  try {
    const showCast = await axios.get(
      `https://api.tvmaze.com/shows/${showId}/cast`
    );
    if (showCast.data.length == 1) {
        const coStarDiv = document.createElement("DIV");
        const noStarDiv = document.createElement("P");
        coStarDiv.classList.add("fellow-cast");
        noStarDiv.innerText = "No costars for this show"
        coStarsContainer.append(coStarDiv);
        coStarDiv.append(noStarDiv);
	    coStarsContainer.style.opacity = "1";
    } else {
	    let castNo = 0;
	    for (let cast of showCast.data) {
	      if (castNo < 3 && cast.person.name != actorName.innerText) {
	        const coStarDiv = document.createElement("DIV");
	        const castName = document.createElement("H3");
	        const castImg = document.createElement("IMG");
	        coStarDiv.classList.add("fellow-cast");
	        coStarDiv.addEventListener("mouseup", function (e) {
	        	if (e.which == 1) {
		        	if (e.composedPath()[0].alt) {
		          		searchName(e.composedPath()[0].alt);
		        	} else {
		        		searchName(e.composedPath()[0].innerText);
		        	};
	          		scrollToElement(document);
	        	};
	        }); 
	        castName.innerText = cast.person.name;
	        coStarsContainer.append(coStarDiv);
	        coStarDiv.append(castName);
	        if (cast.person.image) {
	          castImg.src = cast.person.image.medium;
	        } else {
	          castImg.src =
	            "https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png";
	        }
	        castImg.alt = cast.person.name;
	        coStarDiv.append(castImg);
	        castNo++;
	        coStarsContainer.style.opacity = "1";
	      };
	    }
	};
  } catch (e) {
    console.log(e);
  }
};

form.addEventListener("submit", function (e) {
  e.preventDefault();
  if (form.elements.query.value.length > 0 && sugSelected == -1) {
    searchName(form.elements.query.value);
  } else if (actorId) {
    searchName(actorId);
  } else {
    alert("Please enter a name.");
  }
});

form[0].addEventListener("input", function (e) {
  typedQuery = this.value
  clearSuggestions();
  if (typedQuery.length > 3 && typedQuery.includes(" ")) {
    searchSuggestions(typedQuery);
  } else {
    suggestions.style.border = "none";
  }
});

form[0].addEventListener("focus", function (e) {
  const liveInput = this.value;
  suggestions.style.opacity = ".97";
  clearSuggestions();
  if (liveInput.length > 3 && liveInput.includes(" ")) {
    searchSuggestions(liveInput);
  } else {
    suggestions.style.border = "";
  }
});

form.addEventListener("focusout", function () {
  suggestions.style.opacity = "0";
  sugsOn = false;
});

actorResult.addEventListener("mousedown", function (e) {
	if (e.which == 1) {
  		getTopShows(actorId);
  		coStarsContainer.style.opacity = "0";
	};
});
actorResult.addEventListener("mouseup", function (e) {
	if (e.which == 1) {
  		scrollToElement(showsCont);
	};
});

logoText.addEventListener("click", function (e) {
  window.location.href = window.location.href;
});

const searchSuggestions = async function (queryText) {
  const config = { params: { q: queryText } };
  const searchSugRes = await axios.get(
    `https://api.tvmaze.com/search/people`,
    config
  );
  sugsOn = true;
  for (let results of searchSugRes.data) {
    const actorCheck = await axios.get(
      `https://api.tvmaze.com/people/${results.person.id}?embed=castcredits`
    );
    if (actorCheck.data._embedded.castcredits.length > 0) {
      const searchSug = document.createElement("P");
      searchSug.innerText = results.person.name;
      searchDiv.children[1].append(searchSug);
      searchSug.addEventListener("mouseenter", function (e) {
        this.classList.add("suggestion-focus");
        actorId = results.person.id;
      });
      searchSug.addEventListener("mouseleave", function (e) {
        this.classList.remove("suggestion-focus");
      });
      searchSug.addEventListener("click", function () {
        searchName(results.person.name);
      });
    }
  }
};

document.addEventListener("keydown", function (e) {
  if (e.code == "ArrowDown" && sugsOn && sugSelected < suggestions.childElementCount - 1) {
    sugSelected++;
    suggestions.children[sugSelected].classList.add("suggestion-focus");
    form.elements.query.value = suggestions.children[sugSelected].innerText;
    sugSelected != 0
      ? suggestions.children[sugSelected - 1].classList.remove(
          "suggestion-focus"
        )
      : false;
    actorId = suggestions.children[sugSelected].innerText;
  } else if (e.code == "ArrowUp" && sugsOn && sugSelected > 0) {
    sugSelected--;
    suggestions.children[sugSelected].classList.add("suggestion-focus");
    form.elements.query.value = suggestions.children[sugSelected].innerText;
    suggestions.children[sugSelected + 1].classList.remove("suggestion-focus");
  } else if (e.code == "Escape" && sugsOn && sugSelected >= 0) {
  	form.elements.query.value = typedQuery;
  	clearSuggestions();
  }
});
