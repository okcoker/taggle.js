/*global Taggle*/
(function() {
var faux = ['.net','accounting','acting','adobe creative suite','advertising','aerobatics','aikido','air hockey','air sports','airlines','ajax','algorithms','alpine skiing','alternative medicine','alumni relations','amazon web services','administration','amusement parks','angel investing','animation','app development','apparel','applied mathematics','applied physics','archery','architecture','army','art directing','arts & crafts','asp','assembler','asset protection','astrology','auditing','auto racing','auto repair','autocross','automotive','aviation','B2B','B2C','back-end development','backpacking','badminton','baking','ballet','ballroom dancing','bar management','bars','base jumping','baseball','basic','basketball','beach volleyball','behavior management','behavioral health','benefits','biathlon','bicycle','billiards','biology','biotechnology','blogging','BMX','bookkeeping','books','botany','bowling','boxing','branding','bricolage','bridal consulting','bridal design','broadcast journalism','broadcast media','broadcast media consulting','brokerage','business development','business publicism','business supplies','business-to-business sales','business-to-consumer sales','c','c#ˇ','c++','cafes','camping','canyoning','capital markets','career advice','casinos','ceramics','chamber of commerce','chatting','cheerleading','chemicals','chemistry','chess','child development','child welfare','chiropractic','cinema','cinematography','circus art','climbing','clinical research','clothing design','clubs','cms','cobol','coffee shops','coffeescript','collecting antiques','comedy','commercial real estate','commercials','computer hardware','computer networking','computer science','computer security','computer software','concerts','construction','consumer electronics','consumer goods','consumer services','content creation','content strategy','cooking','copywriting','corporate law','corporate recruiting','cosmetics','credit unions','cricket','criminal justice','criminology','cross fit','cruise planning','css','css3','customer support','cycling','d language','dairy','dancing','data aggregation','data integration','data mining','database development','defense','design','design management','diagnostics','dietitian','digital production','digital strategy','direct sales','diving','donations','door-to-door sales','drawing','dreamweaver','driving','e-commerce','e-learning','ecmascript','economics','education','electrical engineering','electronics','email marketing','emergencies','emergency response consulting','empirical studies','energy','energy medicine','engineering','engineering recruiting','enterprise sales','entertainment','entrepreneurship','environmental planning','environmental services','eveningwear design','event management','event production','event promotion','event services','executive compensation','executive office','executive production','executive recruiting','exploring new places','facebook','facilities services','family law','family services','farming','fashion','fencing','festivals','film music','film production','filmmaking','financial analysis','financial services','fine art','fire extinguishing','fishery','fishing','fitness','football','forensic consulting','forensics','formula racing','forth','fortran','freelance art','freelance design','freelance development','freelance video production','freight delivery','frisbee','front-end development','fundraising','gadgets','gambling','game development','gardening','git','github','global talent management','government administration','government relations','graphic design','guitar instructor','half marathon','haml','haskell','healing consultant','health','health care','health coaching','hedge funds','higher education','hiking','hockey','holistic medicine','homeland security','hospitality','hotels','html','html5','human biology','human resources','hunting','hypnotherapy','illustrator','immigration law','import & export','independent motion pictures','independent theater production','industrial automation','industrial engineering','information security','information services','information technology','insurance','integrative medicine','intellectual property','interaction design','interior design','internal revenue service','international affairs','international development','international recruitment','international trade','international travel','internet','internet marketing','internet security','investigations','investment banking','investment management','IT recruiting','java','javascript','jazz clubs','jazz instructor','jewelry','jogging','joomla','journalism','jquery','jquery mobile','judiciary','karaoke','kart racing','kickboxing','knitting','lacrosse','land surveying','landscape design','law enforcement','law practice','law protection','legal services','legislative office','leisure','libraries','limousine service','linux','lisp','localization','Logic','logistics','lua','luxury goods','machinery','magic','malls','management','management consulting','maritime','market research','marketing','marketing strategy','massage','mathematics','mechanical design','mechanical engineering','media production','medical devices','medical practice','meditation','meeting planning','mental healthcare','merchandise planning','mergers & acquisitions','military','mining','mobile development','modeling','modula','mongodb','mootools','motion pictures','motocross','motorcycle racing','movie theaters','ms office','museums','music','musical instruments instructor','musical theater','mysql','nanotechnology','napping','nascar','natural healthcare','natural resources','neo4j','netrexx','network security','newspapers','nonprofit consulting','nonprofit organization','nursery','oberon','offshoring','oil','online marketing','online media','opera','outsourcing','packaging','paintball','painting','parachuting','parks','pascal','patent protection','payroll','perl','personal PR','personal shopping','personal training','pharmaceuticals','philanthropy','phonegap','photography','photoshop','php','physics','piano instructor','ping pong','playing cards','playing computer games','playing sports','playing video games','playwriting','police','policy counseling','policy institutes','policy strategy','political consulting','political organization','PR','primary education','private equity','product engineering','product management','professional networking','professional training','program development','programming','project engineering','project estimation','project management','prolog','proofreading','property control','property management','prosecution','psychology','psychotherapy','public policy','public relations','public safety','public speaking','publishing','python','quantitative analysis','racquetball','railroad','railroad manufacturing','ranching','reading','real estate','rebol','recreational facilities','recreational services','recruiting','recruitment consulting','redis','religious institutions','renewables','renovations','reporting','research','residential real estate','restaurants','resume writing','risk management','robotics','rock climbing','roller coasters','rowing','ruby','ruby on rails','rugby','running','sailing','sales','scala','scheme','scrabble','screenwriting','scriptol','scuba diving','sculptures','secondary education','securities trading','security','semiconductors','SEO','sewing','sexology','shipbuilding','shooting','sinatra','singing','ski jumping','skiing','skysurfing','smalltalk','snooker','snowboarding','soccer','social entrepreneurship','social media marketing','softball','software design','software engineering','songwriting','spirits','spoken word','sporting events','sporting goods','sports','sql','squash','staffing','stand-up comedy','startup accelerators','startups','statistics','storage','subversion','supermarkets','supply chain','swimming','swing dancing','systems engineering','table tennis','taekwondo','talent acquisition','talent management','tango','tax planning','tcl','teaching','technical recruiting','technical writing','technology law','telecommunications','telemarketing','tennis','textiles','theater','therapeutic massage','think tanks','tobacco','tourism','trade shows','traditional Chinese medicine','training & development','translation','transportation','travel','traveling','triathlon','trucking','TV production','unicycling','unix','urban planning','user experience','user interface','utilities','UX/UI','VC','venture capital','veterinary','visual design','visual effects','volleyball','walking','warehousing','watching cartons','watching movies','watching TV','web design','web development','weight loss','wellness','wholesale','windsurfing','wine','wireless','wiring','wordpress','wrestling','writing','writing poems','xml','yoga','youth counseling','youth development','zoology'];

    // The example code uses the real id so i'm selecting these elements
    // via jquery so we dont screw with the examples
    new Taggle($('.example1.textarea')[0]);

    new Taggle($('.example2.textarea')[0], {
        tags: ['These', 'are', 'prefilled', 'tags']
    });

    new Taggle($('.example3.textarea')[0], {
        tags: ['Try', 'entering', 'one', 'of', 'these', 'tags'],
        duplicateTagClass: 'bounce'
    });

    var example4 = new Taggle($('.example4.textarea')[0], {
        duplicateTagClass: 'bounce'
    });

    var container = example4.getContainer();
    var input = example4.getInput();

    $(input).autocomplete({
        source: faux,
        appendTo: container,
        position: { at: 'left bottom', of: container },
        select: function(e, v) {
            e.preventDefault();
            //Add the tag if user clicks
            if (e.which === 1) {
                example4.add(v.item.value);
            }
        }
    });

    new Taggle($('.example5.textarea')[0], {
        onBeforeTagAdd: function(event, tag) {
            return confirm('You really wanna add ' + tag + '?');
        },
        onTagAdd: function(event, tag) {
            $('.example5-event').text('You just added ' + tag);
        },
        onBeforeTagRemove: function(event, tag) {
            return confirm('You really wanna remove ' + tag + '?');
        },
        onTagRemove: function(event, tag) {
            $('.example5-event').text('You just removed ' + tag);
        }
    });

    var six = new Taggle($('.example6.textarea')[0]);

    six.add('one');
    six.add(['two', 'three', 'four', 'four', 'five', 'five']);
    six.remove('five');
    six.remove('four', true);

    new Taggle($('.example7a.textarea')[0], {
        placeholder: 'Type your favorite type of juice... (hint: orange)',
        allowDuplicates: true,
        allowedTags: ['orange']
    });

    new Taggle($('.example7b.textarea')[0], {
        placeholder: 'Type your favorite type of juice... (hint: apple)',
        allowDuplicates: true,
        disallowedTags: ['apple']
    });

    new Taggle($('.delicious.textarea')[0], {
        tags: ['tags', 'like', 'delicious']
    });

    new Taggle($('.stackoverflow.textarea')[0], {
        tags: ['or', 'like', 'stackoverflow']
    });
}());
