/**
 * Created by nitaip on 19/07/2015.
 */


function inboxZero() {
    return $('<div>' +
        '<div id="inbox-pull-request-reviewer" class="tabs-pane active-pane" aria-hidden="false">' +
        '<table class="aui paged-table pull-requests-table no-rows" id="inbox-pull-request-table-reviewer" data-last-updated="1438589113976">' +
        '<thead>' +
        '<tr>' +
        '<th class="repository" scope="col">Repository</th>' +
        '<th class="title" scope="col">Title</th><th class="author" scope="col">Author</th>' +
        '<th class="reviewers" scope="col">Reviewers</th><th class="comment-count" scope="col"></th>' +
        '<th class="pull-request-list-task-count-column" title="" scope="col"></th><th class="source" scope="col">Source</th>' +
        '<th class="destination" scope="col">Destination</th><th class="updated" scope="col">Updated</th>' +
        '</tr>' +
        '</thead><tbody></tbody></table>' +
        '<div class="paged-table-message pull-request-table-message">' +
        '<span class="aui-icon aui-icon-large aui-iconfont-workbox-empty">No pull requests to approve</span>' +
        '<h3>Inbox Zero</h3></div><div class="spinner" style="display: none;"></div></div><div>');
}

function branchBlock(ref) {
    var url = "sourcetree://checkoutRef?type=stash&ref=" + ref['id'] + "&" +
        "baseWebUrl=" + host() + "&cloneUrl=" + ref['repository']['cloneUrl'];
    return '<a href="' + url + '" target="stree">' + '<span class="aui-lozenge ref-lozenge monospace-lozenge" data-ref-tooltip="' + ref['displayId'] + '">' +
        '<span class="ref branch"><span class="aui-icon aui-icon-small aui-iconfont-devtools-branch-small"></span>' +
        '<span class="name" aria-label="branch ' + ref['displayId'] + '">' + ref['displayId'] + '</span>' +
        '</span>' +
        '</a>';
}

function mkTD(pr, tdType) {
    switch (tdType) {
        case 'repository': {
            /** @TODO REMAKE THIS! */
            const repository = pr.fromRef.repository;
            const project = repository.project;
            const repositoryUrl = repository.links.self[0].href;
            const projectUrl = project.links.self[0].href;
            return $(
                '<td class="repository">' +
                '<span class="aui-avatar aui-avatar-small aui-avatar-project">' +
                '<span class="aui-avatar-inner">' +
                `<img src="${projectUrl}/avatar.png" alt="${project.name}">` +
                '</span>' +
                '</span>' +
                `<span title="apkMetadata"><a href="${repositoryUrl}">${repository.name}</a></span>` +
                '</td>'
            );
        }
        case 'title': {
            /** @TODO REMAKE THIS! */
            const mergeData = 'title="' + pr['title'].replace(/"/g, '\"') + '" ';
            const prUrl = pr.links.self[0].href;
            if ((localStorage["_show_mergability"] == "true") && (!pr.mergeStatus.canMerge)) {
                if (pr.mergeStatus.conflicted) {
                    pr.mergeStatus.vetoes.unshift("Conflicts must be resolved before pull request can be merged.")
                }
                margeData = 'title="' + _.map(pr.mergeStatus.vetoes, function (veto) {
                        return veto.detailedMessage
                    }).join('\n') + '" class="merge-disabled"';
            }
            return $(
                '<td class="title">' +
                `<a ${mergeData} href="${prUrl}">${pr.title}</a>` +
                '</td>'
            );
        }
        case 'author': {
            /** @TODO REMAKE THIS! */
            const author = pr.author.user;
            const authorUrl = author.links.self[0].href;

            return $(
                '<td class="author">' +
                `<div class="avatar-with-name" title="${author.displayName}">` +
                `<span class="aui-avatar aui-avatar-small user-avatar" data-username="${author.name}">` +
                `<span class="aui-avatar-inner"><img src="${authorUrl}/avatar.png" alt="${author.displayName}"></span>` +
                '</span>' +
                `<a href="${authorUrl}" class="secondary-link">${author.displayName}</a>` +
                '</div>' +
                '</td>'
            );
        }
        case 'reviewers':
            /** @TODO REMAKE THIS! */
            var td = $('<td class="reviewers"></td>');
            var revs = _.sortBy(pr['reviewers'],
                function (rev) {
                    return -1 * (rev.user.id);
                });
            revs.forEach(function (rev) {
                const revUrl = rev.user.links.self[0].href;
                td.append($(
                    '<span class="aui-avatar aui-avatar-small aui-avatar-badged user-avatar ' +
                    `${rev.approved ? '' : 'badge-hidden'}  avatar-dimmed avatar-tooltip participant-item" ` +
                    `data-username="${rev.user.name}">` +
                    '<span class="aui-avatar-inner">' +
                    `<img src="${revUrl}/avatar.png" alt="${rev.user.displayName}" original-title="${rev.user.displayName}">` +
                    '</span>' +
                    '<span class="badge approved">?</span>' +
                    '</span>'
                ));
            });
            return td;

        /**
          * Comments seem to be gone from the response json (Dedicated endpoint)
          * @see https://developer.atlassian.com/static/rest/bitbucket-server/4.4.1/bitbucket-rest.html#idp3523056
          */
        case 'comment-count_':
            var comments = pr['attributes']['commentCount'] || 0;
            var td_comm = $('<td class="comment-count"></td>');
            if (Number(comments)) {
                td_comm.append($(
                    '<span class="comment-count" title="' + comments + ' comments">' +
                    '<span class="aui-icon aui-icon-small aui-iconfont-comment">' + comments + ' comments</span>' + comments + '' +
                    '</span>'
                ));
            }
            return td_comm;

        /**
          * Tasks are gone as well (Dedicated endpoint)
          * https://developer.atlassian.com/static/rest/bitbucket-server/4.4.1/bitbucket-rest.html#idp2156352
          */
        case 'task-count_':
            var tasks = Number(pr['attributes']['openTaskCount'] || 0);
            var resolvedTasks = Number(pr['attributes']['resolvedTaskCount'] || 0);
            var totTasks = tasks + resolvedTasks;
            var td_tasks = $('<td class="pull-request-list-task-count-column-value" redify="' + tasks + '"></td>');
            if (Number(totTasks)) {
                td_tasks.append($(
                    '<span class="replacement-placeholder" data-pull-request-id="' + pr['id'] + '" data-repository-id="' + pr['fromRef']['repository']['id'] + '" style="display: inline;">' +
                    '<span class="pr-list-open-task-count" title="' + tasks + ' open tasks">' +
                    '<span class="aui-icon aui-icon-small aui-iconfont-editor-task" data-pull-request-id="' + pr['id'] + '">Resolved/Total tasks:</span>' +
                    '<span class="task-count">' + resolvedTasks + ' / ' + totTasks + '<span></span></span></span></span>'
                ));
            }
            return td_tasks;
        case 'source':
            return $('<td class="source">' +
                branchBlock(pr['fromRef']) +
                '</td>');

        case 'destination':
            return $(
                '<td class="destination">' +
                branchBlock(pr['toRef']) +
                '</td>');

        case 'updated':
            return $('<td class="updated">' +
                '<time title="' + moment(pr['updatedDate']).format("D MMMM YYYY HH:mm") + '" ' +
                'datetime="' + moment(pr['updatedDate']).format() + '">'
                + moment(pr['updatedDate']).fromNow() + '</time></td>');

        default:
            return $('<td class="repository"></td>');
    }
}

function mkTR(pr) {
    var tr = $('<tr data-pullrequestid="' + pr['id'] + '" class="pull-request-row current-user"></tr>');
    var tds = ['repository', 'title', 'author', 'reviewers', 'comment-count', 'task-count', 'source', 'destination', 'updated'];

    var mkTDPartial = _.partial(mkTD, pr);
    return Promise.map(tds, mkTDPartial)
        .each(function (td) {
            tr.append(td)
        })
        .then(function () {
            return tr;
        });
}

function divBase(id, title, ignoreThead) {
    return $('<div><div id="' + (id || '') + '" class="tabs-pane active-pane" aria-hidden="false">' +
        ((title && !(localStorage["_hide_section_title"] == "true")) ? ('<div class="aui-inline-dialog-contents contents" style="width: 870px; max-height: 718px;"><h4>' + title + '</h4></div>') : '') +
        '<table class="aui paged-table pull-requests-table" id="' + id + '" data-last-updated="' + Date.now() + '" style="display: table;">' +
        (ignoreThead ? "" : '<thead><tr>' +
        '<th class="repository" scope="col">Repository</th>' +
        '<th class="title" scope="col">Title</th>' +
        '<th class="author" scope="col">Author</th>' +
        '<th class="reviewers" scope="col">Reviewers</th>' +
        '<th class="comment-count" scope="col"></th>' +
        '<th class="pull-request-list-task-count-column" title="" scope="col"></th>' +
        '<th class="source" scope="col">Source</th><th class="destination" scope="col">Destination</th>' +
        '<th class="updated" scope="col">Updated</th></tr></thead>') +
        '<tbody></tbody></table></div></div>');
}

function mkDIV(data, divId, divTitle) {
    var values = (data && data.values) || [];
    var div = divBase(divId, divTitle + " (" + values.length + ")");
    return Promise.map(values, mkTR)
        .each(function (tr) {
            div.find('tbody').append(tr);
        })
        .then(function () {
            return div.html();
        })

}
