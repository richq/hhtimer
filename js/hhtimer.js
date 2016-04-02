var notecolors = {
    "W": "white",
    "P": "purple",
    "C": "cyan",
    "R": "red",
    "O": "orange",
    "B": "blue",
    "G": "green",
    "Y": "yellow"
};

var DANGER_LEVEL = 15;

function getsongs(notes) {
    var len = melodies.length;
    for (var i = 0; i < len; i++) {
        var songs = melodies[i].songs;
        if (notes === melodies[i].notes)
            return songs;
    }
    return [];
}

function getexamples(notes) {
    var len = melodies.length;
    for (var i = 0; i < len; i++) {
        var examples = melodies[i].examples;
        if (notes === melodies[i].notes)
            return examples;
    }
    return [];
}

function cleartable(tbody) {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}

function createMeter(id, value, max) {
    /*
     * <div style="padding:2px;background:#CCC;">
     *   <span>25%</span>
     *   <div style="width:25%;background:#F00;text-align:center;"></div>
     * </div>
    */
    var outerdiv = document.createElement("div");
    outerdiv.setAttribute("class", "progress");
    var innerdiv = document.createElement("div");
    innerdiv.setAttribute("class", "progress-bar");
    innerdiv.setAttribute("role", "progressbar");
    outerdiv.appendChild(innerdiv);
    var span = document.createElement("span");
    // span.setAttribute("class", "sr-only");
    innerdiv.appendChild(span);

    outerdiv.setAttribute("id", id);
    outerdiv.setAttribute("aria-valuemax", max);
    outerdiv.setAttribute("aria-valuemin", 0);
    setValue(outerdiv, value);
    return outerdiv;
}

function getMeters(scope) {
    return scope.getElementsByClassName("progress");
}

function getMeterById(id) {
    return document.getElementById(id);
}

function getValue(meterDiv) {
    return parseInt(meterDiv.getAttribute("aria-valuenow"), 10);
}

function getMax(meterDiv) {
    return parseInt(meterDiv.getAttribute("aria-valuemax"), 10);
}

function redoMeterLayout(meterDiv) {
    var value = getValue(meterDiv);
    var max = getMax(meterDiv);
    var pc = Math.min(100, 100 * value / max);
    var success = "progress-bar-success";
    var danger = "progress-bar-danger";
    if (value < DANGER_LEVEL && !$(meterDiv.firstChild).is(danger)) {
        $(meterDiv.firstChild).removeClass(success).addClass(danger);
    } else if (value >= DANGER_LEVEL && !$(meterDiv.firstChild).is(success)) {
        $(meterDiv.firstChild).removeClass(danger).addClass(success);
    }

    var style = "width:" + pc + "%;";
    meterDiv.firstChild.setAttribute("style", style);
    var spans = meterDiv.getElementsByTagName("span");
    var span = spans[0];
    if (!span.firstChild) {
        span.appendChild(document.createTextNode(value));
    } else {
        spans[0].firstChild.data = value;
    }
}

function setMax(meterDiv, newmax) {
    meterDiv.setAttribute("aria-valuemax", newmax);
    redoMeterLayout(meterDiv);
}

function setValue(meterDiv, newvalue) {

    var oldval = getValue(meterDiv);
    meterDiv.setAttribute("aria-valuenow", newvalue);
    redoMeterLayout(meterDiv);
    if (newvalue > oldval) {
        // expanding? gotta go fast!
        $(meterDiv.firstChild).addClass("progress-bar-fast");
    } else {
        $(meterDiv.firstChild).removeClass("progress-bar-fast");
    }

}

function melodyDurationExtended(tbody, time) {
    var progresses = getMeters(document);
    var len = progresses.length;
    for (var i = 0; i < len; i++) {
        var p = progresses[i];
        var value = getValue(p);
        if (!value)
            continue;

        var max = getMax(p);
        var newvalue = Math.min(value + time, max);
        setValue(p, newvalue);
    }
}

function extend(notes, time, extendtime) {
    if (!time)
        return;
    var progress = getMeterById("timer_" + notes);
    var tbody = progress.parentNode.parentNode.parentNode;
    var currvalue = getValue(progress);
    var newvalue = time;
    if (currvalue > 0 && extendtime > 0) {
        newvalue = Math.min(currvalue + extendtime, time);
    }
    setValue(progress, newvalue);

    if (tbody.getAttribute("notes") === "PRO" && time <= 40) {
        // special song - affects all current songs
        melodyDurationExtended(tbody, time);
    }
}

function maestrochange(ent) {
    var hasmaestro = document.getElementById("maestro").checked ? 1 : 0;
    var tbody = document.getElementById("maintable");
    var notes = tbody.getAttribute("notes");
    var songs = getsongs(notes);
    var len = songs.length;
    var rows = tbody.getElementsByTagName("tr");
    for (var i = 0; i < len; i++) {
        var row = rows[i];
        setSongRowTime(row, songs[i], hasmaestro);
        var progress = getMeters(row);
        var currval = getValue(progress[0]);
        var currmax = getMax(progress[0]);
        var newmax = songs[i].time[hasmaestro];
        setMax(progress[0], newmax);
        if (!hasmaestro && currval > newmax) {
            var used = Math.max(0, currmax - currval);
            var newval = Math.max(0, newmax - used);
            setValue(progress[0], newval);
        }
    }
}

function setSongRowTime(tr, thissong, hasmaestro) {
    var extendtime = 0;
    if (thissong.extend !== undefined) {
        extendtime = thissong.extend[hasmaestro];
    }
    var key = thissong.combos[0];
    /* jshint -W014 */
    tr.setAttribute("onclick",
                    "extend('"
                            + key + "', "
                            + thissong.time[hasmaestro]
                            + ", " + extendtime
                            + ")");
    /* jshint +W014 */
}

function showtable(notes) {
    var hasmaestro = document.getElementById("maestro").checked ? 1 : 0;
    var tbody = document.getElementById("maintable");
    cleartable(tbody);
    var currsel = document.getElementById("currentselection");
    cleartable(currsel);
    var examples = getexamples(notes);
    appendcolourednotes(currsel, notes);
    var caret = document.createElement("span");
    caret.setAttribute("class", "caret");
    currsel.appendChild(document.createTextNode(" " + examples + " "));
    currsel.appendChild(caret);
    tbody.setAttribute("notes", notes);
    var songs = getsongs(notes);
    var len = songs.length;
    for (var i = 0; i < len; i++) {
        var thissong = songs[i];
        var tr = document.createElement("tr");
        setSongRowTime(tr, thissong, hasmaestro);
        var td = document.createElement("td");
        var combolen = thissong.combos.length;
        for (var j = 0; j < combolen; j++) {
            if (j > 0) {
                td.appendChild(document.createTextNode(" / "));
            }
            appendcolourednotes(td, thissong.combos[j]);
        }
        tr.appendChild(td);
        td = document.createElement("td");
        td.appendChild(document.createTextNode(thissong.name));
        tr.appendChild(td);

        td = document.createElement("td");
        var id = "timer_" + thissong.combos[0];
        var progress = createMeter(id, 0, thissong.time[hasmaestro]);
        td.appendChild(progress);

        tr.appendChild(td);

        tbody.appendChild(tr);
    }
}

function appendcolourednotes(appendto, notes) {
    for (var i = 0; i < notes.length; i++) {
        //"<span x='"+notes[j]+"'/>");
        var span = document.createElement("span");
        span.setAttribute("class", notes[i]);
        appendto.appendChild(span);
    }
}

function showdata() {
    var len = melodies.length;
    var select = document.getElementById("selectionlist");
    var ul = select.getElementsByClassName("dropdown-menu")[0];
    cleartable(ul);
    var tryhardonly = document.getElementById("tryhard").checked ? 1 : 0;
    for (var i = 0; i < len; i++) {
        var notes = melodies[i].notes;
        var songs = melodies[i].songs;
        var examples = melodies[i].examples;
        if (tryhardonly && notes[0] === "W")
            continue;
        // create a button for this one.
        var li = document.createElement("li");
        var inner = document.createElement("a");
        li.setAttribute("id", notes);
        appendcolourednotes(inner, notes);
        inner.appendChild(document.createTextNode(" " + examples));
        li.appendChild(inner);
        li.setAttribute("onclick", "showtable(this.id);");
        ul.appendChild(li);
    }
}

function unpause() {
    var pausebutton = document.getElementById("pause");
    pausebutton.setAttribute("value", "Pause");
}

function pause() {
    var pausebutton = document.getElementById("pause");
    pausebutton.setAttribute("value", "Resume");
}

function superreset() {
    var progresses = getMeters(document);
    var len = progresses.length;
    for (var i = 0; i < len; i++) {
        var p = progresses[i];
        setValue(p, 0);
    }
    unpause();
}

function ispaused() {
    return document.getElementById("pause").getAttribute("value") === "Resume";
}

function togglepause() {
    if (ispaused()) {
        unpause();
    } else {
        pause();
    }
}

function starttimers() {
    setInterval(function () {
        var decrement = ispaused() ? 0 : 1;
        var progresses = getMeters(document);
        var len = progresses.length;
        for (var i = 0; i < len; i++) {
            var p = progresses[i];
            var value = getValue(p);
            if (value > 0) {
                var newvalue = value - decrement;
                setValue(p, newvalue);
                if (!newvalue) {
                    // just went to 0, play a sound effect
                    var hassound = document.getElementById("soundfx").checked ? 1 : 0;
                    var hasvoice = document.getElementById("voicefx").checked ? 1 : 0;

                    if (hasvoice) {
                        try {
                            var tr = p.parentNode.parentNode;
                            var title = tr.getElementsByTagName("td")[1].firstChild.data;
                            // remove (L) (S) or /
                            title = title.replace(/(\(.\)|\/)/, " ");
                            var u = new SpeechSynthesisUtterance(title + " finished");
                            window.speechSynthesis.speak(u);
                        } catch (e) {
                            // oh no, give up
                        }
                    }
                    if (hassound) {
                        soundEffect(
                            523.25,       //frequency
                            0.05,         //attack
                            0.2,          //decay
                            "sine",       //waveform
                            3,            //volume
                            0.8,          //pan
                            0,            //wait before playing
                            600,          //pitch bend amount
                            true,         //reverse
                            100,          //random pitch range
                            0,            //dissonance
                            undefined,    //echo: [delay, feedback, filter]
                            undefined     //reverb: [duration, decay, reverse?]
                        );
                    }
                }
            }
        }
    }, 1000);
}

showdata();
starttimers();
