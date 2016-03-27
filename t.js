var notecolors = {
    "P": "purple",
    "C": "cyan",
    "R": "red",
    "O": "orange",
    "B": "blue",
    "G": "green",
    "Y": "yellow"
};
function getsongs(notes) {
    var len = data.melodies.length;
    for (var i = 0; i < len; i++) {
        var songs = data.melodies[i].songs;
        if (notes === data.melodies[i].notes)
            return songs;
    }
    return [];
}

function cleartable(tbody) {
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
}

function melodyDurationExtended(tbody, time) {
    var progresses = document.getElementsByTagName("progress");
    var len = progresses.length;
    for (var i = 0; i < len; i++) {
        var p = progresses[i];
        var value = parseInt(p.getAttribute("value"), 10);
        var max = parseInt(p.getAttribute("max"), 10);
        if (value == 0)
            continue;

        var newvalue = Math.min(value + time, max);
        var ps = document.getElementById("ps_" + p.id);
        updateProgress(p, ps, newvalue);
    }
}

function setProgressSpanValue(ps, newvalue) {
    cleartable(ps);
    ps.setAttribute("x", newvalue);
    ps.appendChild(document.createTextNode(pad(newvalue, 3)));
}

function updateProgress(progress, ps, newvalue) {
    progress.setAttribute("value", newvalue);
    setProgressSpanValue(ps, newvalue);
}

function extend(notes, time, extendtime) {
    if (time == 0)
        return;
    var progress = document.getElementById("timer_" + notes);
    var tbody = progress.parentNode.parentNode.parentNode;
    var ps = document.getElementById("ps_" + progress.id);
    var currvalue = parseInt(progress.getAttribute("value"), 10);
    var newvalue = time;
    if (currvalue > 0 && extendtime > 0) {
        newvalue = Math.min(currvalue + extendtime, time);
    }
    updateProgress(progress, ps, newvalue);

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
        var progress = row.getElementsByTagName("progress");
        progress[0].setAttribute("max", songs[i].time[hasmaestro]);
    }
}

function setSongRowTime(tr, thissong, hasmaestro) {
    var extendtime = 0;
    if (thissong.extend !== undefined) {
        extendtime = thissong.extend[hasmaestro];
    }
    var key = thissong.combos[0];
    tr.setAttribute("onclick",
                    "extend('"
                            + key + "', "
                            + thissong.time[hasmaestro]
                            + ", " + extendtime
                            + ")");
}

function showtable(notes) {
    var hasmaestro = document.getElementById("maestro").checked ? 1 : 0;
    var tbody = document.getElementById("maintable");
    cleartable(tbody);
    var currsel = document.getElementById("currentselection");
    cleartable(currsel);
    appendcolourednotes(currsel, notes);
    tbody.setAttribute("notes", notes);
    var songs = getsongs(notes);
    var len = songs.length;
    for (var i = 0; i < len; i++) {
        // add something...
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
        var progress = document.createElement("progress");
        var key = thissong.combos[0];
        progress.setAttribute("id", "timer_" + key);
        progress.setAttribute("max", thissong.time[hasmaestro]);
        progress.setAttribute("value", 0);
        td.appendChild(progress);

        var ps = document.createElement("span");
        ps.setAttribute("id", "ps_timer_" + key);
        ps.setAttribute("class", "progressspan");
        setProgressSpanValue(ps, 0);
        td.appendChild(ps);

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
    var len = data.melodies.length;
    var select = document.getElementById("selectionlist");
    for (var i = 0; i < len; i++) {
        var notes = data.melodies[i].notes;
        var songs = data.melodies[i].songs;
        var examples = data.melodies[i].examples;
        // create a button for this one.
        var inner = document.createElement("option");
        inner.setAttribute("id", notes);
        inner.setAttribute("value", notes);
        var image = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' version='1.1' height='40px' width='100px'>";
        for (var j = 0; j < notes.length; j++) {
            image = image + "<text fill='" + notecolors[notes[j]] + "' x='" + (j * 10) + "' y='15' font-size='16'>\\266a</text>";
        }
        image = image + "</svg>";
        var style = "background-image:url(\"" + image + "\"); text-align: right; background-repeat: no-repeat;";
        inner.setAttribute("style", style);
        inner.appendChild(document.createTextNode(" " + examples));
        select.appendChild(inner);
    }
};

function pad(num, size) {
    var s = "0000" + num;
    return s.substr(s.length-size);
}

function superreset() {
    var progresses = document.getElementsByTagName("progress");
    var len = progresses.length;
    for (var i = 0; i < len; i++) {
        var p = progresses[i];
        var ps = document.getElementById("ps_" + p.id);
        updateProgress(p, ps, 0);
    }
}

function starttimers() {
    setInterval(function () {
        var progresses = document.getElementsByTagName("progress");
        var len = progresses.length;
        for (var i = 0; i < len; i++) {
            var p = progresses[i];
            var ps = document.getElementById("ps_" + p.id);
            var value = p.getAttribute("value");
            if (value > 0) {
                cleartable(ps);
                p.setAttribute("value", value - 1);
                setProgressSpanValue(ps, value - 1);
                if (value == 1) {
                    // just went to 0, play a sound effect
                    var hassound = document.getElementById("soundfx").checked ? 1 : 0;
                    var hasvoice = document.getElementById("voicefx").checked ? 1 : 0;
                    ps.setAttribute("class", "progressspan");

                    if (hasvoice) {
                        try {
                            var tr = p.parentNode.parentNode;
                            var title = tr.getElementsByTagName("td")[1].firstChild.data;
                            // remove (L) (S) or /
                            title = title.replace(/(\(.\)|\/)/, " ");
                            var u = new SpeechSynthesisUtterance(title + " finished");
                            window.speechSynthesis.speak(u);
                        } catch (e) {
                            // oh noes, give up
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
            } else {
                setProgressSpanValue(ps, 0);
            }
        }
    }, 1000);
}

showdata();
starttimers();
