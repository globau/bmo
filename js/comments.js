/* The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 *
 * The Original Code is the Bugzilla Bug Tracking System.
 *
 * The Initial Developer of the Original Code is Netscape Communications
 * Corporation. Portions created by Netscape are
 * Copyright (C) 1998 Netscape Communications Corporation. All
 * Rights Reserved.
 *
 * Contributor(s): Frédéric Buclin <LpSolit@gmail.com>
 *                 Max Kanat-Alexander <mkanat@bugzilla.org>
 *                 Edmund Wong <ewong@pw-wspx.org>
 *                 Anthony Pipkin <a.pipkin@yahoo.com>
 */

function updateCommentPrivacy(checkbox, id) {
    var comment_elem = document.getElementById('comment_text_'+id).parentNode;
    if (checkbox.checked) {
      if (!comment_elem.className.match('bz_private')) {
        comment_elem.className = comment_elem.className.concat(' bz_private');
      }
    }
    else {
      comment_elem.className =
        comment_elem.className.replace(/(\s*|^)bz_private(\s*|$)/, '$2');
    }
}

/* The functions below expand and collapse comments  */

function toggle_comment_display(link, comment_id) {
    var comment = document.getElementById('comment_text_' + comment_id);
    if (comment.matches('.collapsed')) {
        expand_comment(link, comment, comment_id);
    } else {
        collapse_comment(link, comment, comment_id);
    }
}

function toggle_all_comments(action) {
    // If for some given ID the comment doesn't exist, this doesn't mean
    // there are no more comments, but that the comment is private and
    // the user is not allowed to view it.

    document.querySelectorAll('.bz_comment_text').forEach((comment) => {
        var id = comment.id.match(/^comment_text_(\d*)$/);
        if (!id)
            return;
        id = id[1];
        var link = document.getElementById('comment_link_' + id);
        if (action == 'collapse') {
            collapse_comment(link, comment, id);
        } else {
            expand_comment(link, comment, id);
        }
    });
}

function collapse_comment(link, comment, comment_id) {
    link.innerHTML = "[+]";
    comment.classList.add('collapsed');
    document.getElementById(`comment_tag_${comment_id}`).classList.add('collapsed');
}

function expand_comment(link, comment, comment_id) {
    link.innerHTML = "[-]";
    document.getElementById(`cr${comment_id}`)?.classList.add('collapsed');
    document.getElementById(`c${comment_id}`).classList.remove('bz_default_collapsed');
    comment.classList.remove('collapsed');
    document.getElementById(`comment_tag_${comment_id}`).classList.remove('collapsed');
}

function wrapReplyText(text) {
    // This is -3 to account for "\n> "
    var maxCol = BUGZILLA.constant.COMMENT_COLS - 3;
    var text_lines = text.replace(/[\s\n]+$/, '').split("\n");
    var wrapped_lines = new Array();

    for (var i = 0; i < text_lines.length; i++) {
        var paragraph = text_lines[i];
        // Don't wrap already-quoted text.
        if (paragraph.indexOf('>') == 0) {
            wrapped_lines.push('> ' + paragraph);
            continue;
        }

        var replace_lines = new Array();
        while (paragraph.length > maxCol) {
            var testLine = paragraph.substring(0, maxCol);
            var pos = testLine.search(/\s\S*$/);

            if (pos < 1) {
                // Try to find some ASCII punctuation that's reasonable
                // to break on.
                var punct = '\\-\\./,!;:';
                var punctRe = new RegExp('[' + punct + '][^' + punct + ']+$');
                pos = testLine.search(punctRe) + 1;
                // Try to find some CJK Punctuation that's reasonable
                // to break on.
                if (pos == 0)
                    pos = testLine.search(/[\u3000\u3001\u3002\u303E\u303F]/) + 1;
                // If we can't find any break point, we simply break long
                // words. This makes long, punctuation-less CJK text wrap,
                // even if it wraps incorrectly.
                if (pos == 0) pos = maxCol;
            }

            var wrapped_line = paragraph.substring(0, pos);
            replace_lines.push(wrapped_line);
            paragraph = paragraph.substring(pos);
            // Strip whitespace from the start of the line
            paragraph = paragraph.replace(/^\s+/, '');
        }
        replace_lines.push(paragraph);
        wrapped_lines.push("> " + replace_lines.join("\n> "));
    }
    return wrapped_lines.join("\n") + "\n\n";
}

/* This way, we are sure that browsers which do not support JS
   * won't display this link  */

function addCollapseLink(count, collapsed, title) {
    document.write(' <a href="#" class="bz_collapse_comment"' +
                   ' id="comment_link_' + count +
                   '" onclick="toggle_comment_display(this, ' +  count +
                   '); return false;" title="' + title + '">[' +
                   (collapsed ? '+' : '&minus;') + ']<\/a> ');
}

function goto_add_comments( anchor ){
    anchor =  (anchor || "add_comment");
    // we need this line to expand the comment box
    document.getElementById('comment').focus();
    setTimeout(function(){
        document.location.hash = anchor;
        // Firefox doesn't seem to keep focus through the anchor change
        document.getElementById('comment').focus();
    },10);
    return false;
}

if (typeof Node == 'undefined') {
    /* MSIE doesn't define Node, so provide a compatibility object */
    window.Node = {
        TEXT_NODE: 3,
        ENTITY_REFERENCE_NODE: 5
    };
}

/* Concatenates all text from element's childNodes. This is used
 * instead of innerHTML because we want the actual text (and
 * innerText is non-standard).
 */
function getText(element) {
    var child, text = "";
    for (var i=0; i < element.childNodes.length; i++) {
        child = element.childNodes[i];
        var type = child.nodeType;
        if (type == Node.TEXT_NODE || type == Node.ENTITY_REFERENCE_NODE) {
            text += child.nodeValue;
        } else {
            /* recurse into nodes of other types */
            text += getText(child);
        }
    }
    return text;
}
