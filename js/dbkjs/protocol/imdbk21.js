var dbkjs = dbkjs || {};
window.dbkjs = dbkjs;
dbkjs.protocol = dbkjs.protocol || {};
dbkjs.protocol.imdbk21 = {
    feature: null,
    processing: false,
    panel_group: null,
    panel_tabs: null,
    panel_algemeen: null,
    process: function(selection_id) {
//controleer of de currentFeature id gelijk is aan de dbk,
//http://dbk.mapcache.nl/wfs?request=GetFeature&version=2.0&typename=dbk:DBKFeature&outputFormat=gml32&featureID=DBKFeature.1367827139
        $('#infopanel_f').html('');
        if (selection_id) {
            if (!this.feature) {
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.imdbk21.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', ' Objectinformatie wordt opgehaald...', 'alert-info');
                    dbkjs.protocol.imdbk21.feature = {id: selection_id, div: ''};
                    dbkjs.protocol.imdbk21.getObject(selection_id);
                }
            } else if (selection_id === dbkjs.protocol.imdbk21.feature.id) {
                //doe niks
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel_b').html(dbkjs.protocol.imdbk21.feature.div);
                    $('#infopanel_f').html('');
                    $('#infopanel').show();
                    //reset naar eerste tab
                }

            } else {
                //anders opnieuw ophalen.    
                if (!dbkjs.protocol.imdbk21.processing) {
                    $('#infopanel').hide();
                    dbkjs.protocol.imdbk21.processing = true;
                    dbkjs.util.alert('<i class="icon-spinner icon-spin"></i>', ' Objectinformatie wordt opgehaald...', 'alert-info');
                    dbkjs.protocol.imdbk21.feature = {id: selection_id, div: ''};
                    dbkjs.protocol.imdbk21.getObject(selection_id);
                }
            }
        }
    },
    info: function(response) {
        var _obj = dbkjs.protocol.imdbk21;
        if (response) {
            if (response.responseXML) {
                var xmldoc = $.xml2json(response.responseXML);
            } else {
                // let op; internet explorer retourneert altijd null voor responseXML
                // proberen om responseText op te vangen
                // if ($.browser.msie) {
                var parser = new DOMParser();
                var xmlDoc = parser.parseFromString(response.responseText, "application/xml");
                var xmldoc = $.xml2json(xmlDoc);
            }
            if (xmldoc["ows:ExceptionReport"]) {
                _obj.feature = {};
                dbkjs.util.alert('Fout', ' Er is een systeemfout opgetreden. Neem contact op met de beheerder', 'alert-danger');
            } else {
                if (xmldoc["wfs:FeatureCollection"]["wfs:member"]) {
                    _obj.panel_group = $('<div class="tab-content"></div>');
                    _obj.panel_tabs = $('<ul class="nav nav-pills"></ul>');
                    if (xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]) {
                        var div = $('<div class="tabbable"></div>');
                        if (_obj.constructAlgemeen(xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"])) {
                            _obj.constructGevaarlijkeStof(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:gevaarlijkeStofInfo"]
                                    );
                            _obj.constructContact(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:contactInfo"]
                                    );
                            _obj.constructBijzonderheid(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:bijzonderheid"]
                                    );
                            _obj.constructVerblijf(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:verblijf"]
                                    );
                            _obj.constructMedia(
                                    xmldoc["wfs:FeatureCollection"]["wfs:member"]["dbk:DBKObject"]["dbk:foto"]
                                    );
                        }
                        ;
                        div.append(_obj.panel_group);
                        div.append(_obj.panel_tabs);
                        dbkjs.protocol.imdbk21.feature.div = div;
                        $('#infopanel_b').html(div);
                        $('#systeem_meldingen').hide();
                    }
                    $('#infopanel').show();
                } else {
                    _obj.feature = {};
                    dbkjs.util.alert('Fout', ' Geen informatie gevonden', 'alert-danger');
                }
            }
            _obj.processing = false;
        }
    },
    constructRow: function(val, caption) {
        if (!dbkjs.util.isJsonNull(val)) {
            var output = '<tr><td>' + caption + '</td><td>' + val + '</td></tr>';
            return output;
        } else {
            return '';
        }
    },
    constructAlgemeen: function(DBKObject) {
        var _obj = dbkjs.protocol.imdbk21;
        /** Algemene dbk info **/
        if (DBKObject) {
            _obj.feature.formelenaam = DBKObject["dbk:formeleNaam"].value;
            var formelenaam = _obj.feature.formelenaam;
            dbkjs.util.changeDialogTitle('<i class="icon-building"></i> ' + _obj.feature.formelenaam);
            var controledatum = '<span class="label label-warning">Niet bekend</span>';
            var bhvaanwezig = '<span class="label label-warning">Geen BHV aanwezig of onbekend</span>';
            var informelenaam = '';
            var woonplaatsnaam = '';
            var postcode = '';
            var huisnummer = '';
            var vbo_id = '';
            var openbareruimtenaam = '';
            var omsnummer = '';
            var gebruikstype = '';
            var bouwlaag = '';
            var inzetprocedure = '';
            var gebouwconstructie = '';
            var laagste;
            var hoogste;
            if (DBKObject["dbk:informeleNaam"]) {
                _obj.feature.informelenaam = DBKObject["dbk:informeleNaam"].value;
                informelenaam = _obj.feature.informelenaam;
            }
            if (DBKObject["dbk:gebouwconstructie"]) {
                _obj.feature.gebouwconstructie = DBKObject["dbk:gebouwconstructie"].value;
                gebouwconstructie = _obj.feature.gebouwconstructie;
            }
            if (DBKObject["dbk:inzetprocedure"]) {
                _obj.feature.inzetprocedure = DBKObject["dbk:inzetprocedure"].value;
                inzetprocedure = _obj.feature.inzetprocedure;
            }
            if (DBKObject["dbk:controleDatum"]) {
                _obj.feature.controledatum = DBKObject["dbk:controleDatum"].value;
                controledatum = _obj.feature.controledatum;
            }
            if (DBKObject["dbk:BHVAanwezig"]) {
                _obj.feature.bhvaanwezig = DBKObject["dbk:BHVAanwezig"].value;
                bhvaanwezig = '<span class="label label-success">BHV aanwezig</span>';
            }
            if (DBKObject["dbk:OMSnummer"]) {
                _obj.feature.omsnummer = DBKObject["dbk:OMSnummer"].value;
                omsnummer = '' + _obj.feature.omsnummer + '';
            }

            if (DBKObject["dbk:gebruikstype"]) {
                _obj.feature.gebruikstype = DBKObject["dbk:gebruikstype"].value;
                gebruikstype = '' + _obj.feature.gebruikstype + '';
            }

            if (DBKObject["dbk:laagsteBouwlaag"]) {
                laagste = '' + DBKObject["dbk:laagsteBouwlaag"].value + '';
            }
            if (DBKObject["dbk:hoogsteBouwlaag"]) {
                hoogste = '' + DBKObject["dbk:hoogsteBouwlaag"].value + '';
            }
            if (laagste && hoogste) {
                bouwlaag = 'Bouwlaag:' + laagste + ' t/m ' + hoogste + '';
            } else if (laagste && !hoogste) {
                bouwlaag = 'Laagste bouwlaag: ' + laagste + '';
            } else if (hoogste && !laagste) {
                bouwlaag = 'Hoogste bouwlaag: ' + hoogste + '';
            }
            _obj.feature.bouwlaag = bouwlaag;

            _obj.panel_algemeen = $('<div class="tab-pane active" id="collapse_algemeen_' + _obj.feature.id + '"></div>');
            var algemeen_table_div = $('<div class="table-responsive"></div>');
            var algemeen_table = $('<table class="table table-hover"></table>');
            algemeen_table.append(_obj.constructRow(informelenaam, 'Informele naam'));
            algemeen_table.append(_obj.constructRow(controledatum, 'Controledatum'));
            algemeen_table.append(_obj.constructRow(bhvaanwezig, 'BHV'));
            algemeen_table.append(_obj.constructRow(inzetprocedure, 'Inzetprocedure'));
            algemeen_table.append(_obj.constructRow(gebouwconstructie, 'Gebouwconstructie'));
            algemeen_table.append(_obj.constructRow(omsnummer, 'OMS nummer'));
            algemeen_table.append(_obj.constructRow(gebruikstype, 'Gebruik'));
            algemeen_table.append(_obj.constructRow(bouwlaag, 'Bouwlagen'));
            var adres = DBKObject["dbk:adres"];
            if (adres) {
                _obj.feature.adres = [];
                //var adres_div = $('<div class="tab-pane" id="collapse_adres_' + _obj.feature.id + '"></div>');\

                if (adres["dbk:Adres"]) {
                    var temp = adres;
                    adres = [];
                    adres.push(temp);
                }
                $.each(adres, function(adres_index, waarde) {
                    var adres_row = $('<tr></tr>');
                    var adres_div = $('<td colspan="2"></td>');
                    var bag_div = $('<td></td>');
                    if (waarde["dbk:Adres"]["dbk:huisnummer"]) {
                        huisnummer = waarde["dbk:Adres"]["dbk:huisnummer"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:postcode"]) {
                        postcode = waarde["dbk:Adres"]["dbk:postcode"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:woonplaatsNaam"]) {
                        woonplaatsnaam = waarde["dbk:Adres"]["dbk:woonplaatsNaam"].value;
                    }
                    if (waarde["dbk:Adres"]["dbk:openbareRuimteNaam"]) {
                        openbareruimtenaam = waarde["dbk:Adres"]["dbk:openbareRuimteNaam"].value;
                    }
                    adres_div.append('' +
                            openbareruimtenaam + ' ' + huisnummer + '<br/>' +
                            woonplaatsnaam + ' ' + postcode +
                            '');
                    if (waarde["dbk:Adres"]["dbk:bagId"]) {
                        if (waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']) {
                            if (waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID']) {
                                vbo_id = '\nbag vbo: ' + waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value;
                            }
                        }
                    }
                    _obj.feature.adres.push(openbareruimtenaam + ' ' + huisnummer + '\n' + woonplaatsnaam + '  ' + postcode + vbo_id);
                    if (dbkjs.modules.bag) {
                        if (waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID']){
                        var bag_p = $('<p></p>');
                        var bag_button = $('<button type="button" class="btn btn-primary">BAG raadplegen</button>');
                        bag_p.append(bag_button);
                        bag_button.click(function() {
                            if (dbkjs.modules.bag) {
                                dbkjs.modules.bag.getVBO(waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value, function(result) {
                                    if (result.length === 0) {
                                        $('#collapse_algemeen_' + _obj.feature.id).append(
                                                '<div class="alert alert-warning alert-dismissable">' +
                                                '<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
                                                '<strong>Mislukt!</strong>' +
                                                ' verblijfsobject ' + waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value + ' niet gevonden.' +
                                                '</div>'
                                                );
                                    } else {
                                        $('#bagpanel_b').html('');
                                        $.each(result, function(result_index, waarde) {
                                            dbkjs.modules.bag.vboInfo2(waarde);
                                        });
                                        $('#bagpanel').show();
                                    }
                                });
                            } else {
                                alert(waarde["dbk:Adres"]["dbk:bagId"]['dbk:NEN3610ID']['dbk:lokaalID'].value);
                            }
                        });
                        bag_div.append(bag_p);
                        adres_row.append(adres_div);
                        adres_row.append(bag_div);
                    }
                    } else {
                        adres_row.append(adres_div);
                    }

                    algemeen_table.append(adres_row);
                });
                algemeen_table_div.append(algemeen_table);
                _obj.panel_algemeen.append(algemeen_table_div);
                _obj.panel_group.html(_obj.panel_algemeen);
                _obj.panel_tabs.html('<li class="active"><a data-toggle="tab" href="#collapse_algemeen_' + _obj.feature.id + '">Algemeen</a></li>');
                return true;
            } else {
                return false;
            }
        }
    },
    constructGevaarlijkeStof: function(gevaarlijkestof){
        var _obj = dbkjs.protocol.imdbk21;
        if(gevaarlijkestof){
            _obj.feature.gevaarlijkestof = [];
            if (gevaarlijkestof["dbk:GevaarlijkeStof"]) {
                var temp = gevaarlijkestof;
                gevaarlijkestof = [];
                gevaarlijkestof.push(temp);
            }
            $.each(gevaarlijkestof, function(gevstof_index, waarde) {
                var gev = {
                    naamStof: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:naamStof"]) ? "": waarde["dbk:GevaarlijkeStof"]["dbk:naamStof"].value,
                    gevaarsindicatienummer: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:gevaarsindicatienummer"]) ? "" : waarde["dbk:GevaarlijkeStof"]["dbk:gevaarsindicatienummer"].value,
                    UNnummer: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:UNnummer"]) ? "": waarde["dbk:GevaarlijkeStof"]["dbk:UNnummer"].value,
                    hoeveelheid: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:hoeveelheid"]) ? "" : waarde["dbk:GevaarlijkeStof"]["dbk:hoeveelheid"].value,
                    symboolCode: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:symboolCode"]) ? "" : waarde["dbk:GevaarlijkeStof"]["dbk:symboolCode"].value,
                    aanvullendeInformatie: dbkjs.util.isJsonNull(waarde["dbk:GevaarlijkeStof"]["dbk:aanvullendeInformatie"]) ? "" : waarde["dbk:GevaarlijkeStof"]["dbk:aanvullendeInformatie"].value
                };
                _obj.feature.gevaarlijkestof.push(gev);
            });
        }
//        <dbk:gevaarlijkeStofInfo><dbk:GevaarlijkeStof gml:id="GevaarlijkeStof.fid--726ba112_1420c0ad9b3_-718a"><gml:boundedBy><gml:Envelope srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#28992"><gml:lowerCorner>160893.2 402068.7</gml:lowerCorner><gml:upperCorner>160893.2 402068.7</gml:upperCorner></gml:Envelope></gml:boundedBy><dbk:locatie><gml:Point srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#28992"><gml:pos>160893.2 402068.7</gml:pos></gml:Point></dbk:locatie><dbk:naamStof>Vloeibare zuurstof</dbk:naamStof><dbk:gevaarsindicatienummer>225</dbk:gevaarsindicatienummer><dbk:UNnummer>1073</dbk:UNnummer><dbk:hoeveelheid>10600 liter</dbk:hoeveelheid><dbk:symboolCode>EU-GHS03</dbk:symboolCode><dbk:symboolPlaatsing><dbk:SymboolOfLabelpositie><dbk:absolutePositie><gml:Point srsDimension="2" srsName="http://www.opengis.net/gml/srs/epsg.xml#28992"><gml:pos>160893.2 402068.7</gml:pos></gml:Point></dbk:absolutePositie><dbk:symboolschaal>1</dbk:symboolschaal><dbk:hoek>0.0</dbk:hoek></dbk:SymboolOfLabelpositie></dbk:symboolPlaatsing></dbk:GevaarlijkeStof></dbk:gevaarlijkeStofInfo>
    },
    constructContact: function(contact) {
        var _obj = dbkjs.protocol.imdbk21;
        if (contact) {
            _obj.feature.contact = [];
            var contact_div = $('<div class="tab-pane" id="collapse_contact_' + _obj.feature.id + '"></div>');
            if (contact["dbk:Contact"]) {
                var temp = contact;
                contact = [];
                contact.push(temp);
            }
            var contact_table_div = $('<div class="table-responsive"></div>');
            var contact_table = $('<table class="table table-hover"></table>');
            contact_table.append('<tr><th>functie</th><th>naam</th><th>telefoonnummer</th></tr>');
            $.each(contact, function(contact_index, waarde) {
                var cnt = {
                    functie: waarde["dbk:Contact"]["dbk:functie"].value,
                    naam: waarde["dbk:Contact"]["dbk:naam"].value,
                    telefoonnummer: waarde["dbk:Contact"]["dbk:telefoonnummer"].value
                };
                _obj.feature.contact.push(cnt);
                contact_table.append(
                        '<tr>' +
                        '<td>' + cnt.functie + '</td>' +
                        '<td>' + cnt.naam + '</td>' +
                        '<td>' + cnt.telefoonnummer + '</td>'
                        + '</tr>'
                        );
            });
            contact_table_div.append(contact_table);
            contact_div.append(contact_table_div);
            _obj.panel_group.append(contact_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_contact_' + _obj.feature.id + '">Contact</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_contact_' + _obj.feature.id + '">Contact</a></li>');
        }
    },
    constructBijzonderheid: function(bijzonderheid) {
        var _obj = dbkjs.protocol.imdbk21;
        if (bijzonderheid) {
            _obj.feature.bijzonderheden = [];
            var bijzonderheid_div = $('<div class="tab-pane" id="collapse_bijzonderheid_' + _obj.feature.id + '"></div>');
            if (bijzonderheid["dbk:Bijzonderheid"]) {
                var temp = bijzonderheid;
                bijzonderheid = [];
                bijzonderheid.push(temp);
            }
            var bijzonderheid_table_div = $('<div class="table-responsive"></div>');
            var bijzonderheid_table = $('<table class="table table-hover"></table>');
            bijzonderheid_table.append('<tr><th>soort</th><th>informatie</th></tr>');
            var set = {
                Algemeen: {titel: 'Algemeen', waarde: ''},
                Preparatie: {titel: 'Preparatie', waarde: ''},
                Preventie: {titel: 'Preventie', waarde: ''},
                Repressie: {titel: 'Repressie', waarde: ''}
            };
            $.each(bijzonderheid, function(bijzonderheid_index, waarde) {
                var soort = waarde["dbk:Bijzonderheid"]["dbk:soort"].value;
                if (soort) {
                    var bijz = {soort: soort, tekst: waarde["dbk:Bijzonderheid"]["dbk:tekst"].value};
                    _obj.feature.bijzonderheden.push(bijz);
                    set[soort].waarde += bijz.tekst + '<br>';
                }
            });
            $.each(set, function(set_idx, set_entry) {
                if (set_entry.waarde !== '') {
                    bijzonderheid_table.append(
                            '<tr>' +
                            '<td>' + set_entry.titel + '</td>' +
                            '<td>' + set_entry.waarde + '</td>' +
                            +'</tr>'
                            );
                }
            });
            bijzonderheid_table_div.append(bijzonderheid_table);
            bijzonderheid_div.append(bijzonderheid_table_div);
            _obj.panel_group.append(bijzonderheid_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_bijzonderheid_' + _obj.feature.id + '">Bijzonderheden</a></li>');
        }
    },
    constructMedia: function(foto) {
        var _obj = dbkjs.protocol.imdbk21;
        if (foto) {
            _obj.feature.images = [];
            var foto_div = $('<div class="tab-pane" id="collapse_foto_' + _obj.feature.id + '"></div>');
            var image_carousel = $('<div id="carousel_foto_' + _obj.feature.id + '" class="carousel slide" data-interval="false"></div>');
            var image_carousel_inner = $('<div class="carousel-inner"></div>');
            //if (foto["dbk:Foto"]) {
            if (foto["dbk:Foto"]) {
                var temp = foto;
                foto = [];
                foto.push(temp);
            }

            var image_carousel_nav = $('<ol class="carousel-indicators"></ol>');
            $.each(foto, function(foto_index, waarde) {
                var url = waarde["dbk:Foto"]["dbk:URL"].value;
                var naam = waarde["dbk:Foto"]["dbk:naam"].value;
                if (foto_index === 0) {
                    active = 'active';
                } else {
                    active = '';
                }
                var url_arr = url.split(".");
                var extension = url_arr[url_arr.length - 1];
                var timestamp = new Date().getTime();
                if (extension === "pdf" || extension === "doc" || extension === "docx") {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="images/missing.gif""><div class="carousel-caption"><a href="' + url + '" target="_blank"><h1><i class="icon-download icon-large"></h1></i></a><h3>' + waarde["dbk:Foto"]["dbk:naam"].value + '</h3><a href="' + url + '" target="_blank"><h2>Download bestand</h2></a></div></div>');
                } else {
                    image_carousel_inner.append('<div class="item ' + active + '"><img src="' + url + '?timestamp=' + timestamp + '" onerror="dbkjs.util.mediaError(this);"><div class="carousel-caption"><h3>' + naam + '</h3><p></p></div></div>');
                    _obj.feature.images.push(url);
                }

                if (foto.length > 1) {
                    image_carousel_nav.append('<li data-target="#carousel_foto_' + _obj.feature.id + '" data-slide-to="' + foto_index + '" class="' + active + '"></li>');
                }
            });
            image_carousel.append(image_carousel_nav);
            image_carousel.append(image_carousel_inner);
            if (foto.length > 1) {
                image_carousel.append('<a class="left carousel-control" href="#carousel_foto_' + _obj.feature.id + '" data-slide="prev">' +
                        '<span class="icon-prev"></span></a>');
                image_carousel.append('<a class="right carousel-control" href="#carousel_foto_' + _obj.feature.id + '" data-slide="next">' +
                        '<span class="icon-next"></span></a>');
            }
            foto_div.append(image_carousel);
            _obj.panel_group.append(foto_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_foto_' + _obj.feature.id + '">Media</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_foto_' + _obj.feature.id + '">Media</a></li>');
        }
    },
    constructVerblijf: function(verblijf) {
        var _obj = dbkjs.protocol.imdbk21;
        if (verblijf) {
            _obj.feature.verblijf = [];
            var verblijf_div = $('<div class="tab-pane" id="collapse_verblijf_' + _obj.feature.id + '"></div>');
            //if (verblijf["dbk:AantalPersonen"]) {
            if (verblijf["dbk:AantalPersonen"]) {
                var temp = verblijf;
                verblijf = [];
                verblijf.push(temp);
            }
            var verblijf_table_div = $('<div class="table-responsive"></div>');
            var verblijf_table = $('<table class="table table-hover"></table>');
            verblijf_table.append('<tr><th>van</th><th>tot</th><th>aantal</th><th>groep</th></tr>');
            $.each(verblijf, function(verblijf_index, waarde) {
                var verb = {
                    tijdvakbegintijd: waarde["dbk:AantalPersonen"]["dbk:tijdvakBegintijd"].value.replace(":00Z", '').replace('Z', ''),
                    tijdvakeindtijd: waarde["dbk:AantalPersonen"]["dbk:tijdvakEindtijd"].value.replace(":00Z", '').replace('Z', ''),
                    aantal: waarde["dbk:AantalPersonen"]["dbk:aantal"].value,
                    typeaanwezigheidsgroep: waarde["dbk:AantalPersonen"]["dbk:typeAanwezigheidsgroep"].value
                };
                _obj.feature.verblijf.push(verb);
                verblijf_table.append('<tr>' +
                        '<td>' + verb.tijdvakbegintijd + '</td>' +
                        '<td>' + verb.tijdvakeindtijd + '</td>' +
                        '<td>' + verb.aantal + '</td>' +
                        '<td>' + verb.typeaanwezigheidsgroep + '</td>' +
                        '</tr>');
            });
            verblijf_table_div.append(verblijf_table);
            verblijf_div.append(verblijf_table_div);
            _obj.panel_group.append(verblijf_div);
            _obj.panel_tabs.append('<li><a data-toggle="tab" href="#collapse_verblijf_' + _obj.feature.id + '">Verblijf</a></li>');
        } else {
            _obj.panel_tabs.append('<li class="disabled"><a href="#collapse_verblijf_' + _obj.feature.id + '">Verblijf</a></li>');
        }
    },
    getObject: function(id) {
        var params = {
//            request: 'getFeature',
//            version: '2.0',
//            typename: 'dbk:DBKObject',
//            outputFormat: 'gml32',
//            featureID: 'DBKObject.' + id,
            timestamp: new Date().getTime()
        };
        OpenLayers.Request.GET({
            url: 'data/' + id + '.xml',
            "params": params, callback: dbkjs.protocol.imdbk21.info});
    },
    getGebied: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKGebied',
            outputFormat: 'gml32',
            featureID: 'DBKGebied.' + id,
            timestamp: new Date().getTime()
        };
        OpenLayers.Request.GET({url: dbkjs.protocol.imdbk21.url, "params": params, callback: dbkjs.protocol.imdbk21.info});
    },
    getFeature: function(id) {
        var params = {
            request: 'getFeature',
            version: '2.0',
            typename: 'dbk:DBKFeature',
            outputFormat: 'gml32',
            featureID: 'DBKFeature.' + id,
            timestamp: new Date().getTime()
        };
        OpenLayers.Request.GET({url: dbkjs.protocol.imdbk21.url, "params": params, callback: dbkjs.protocol.imdbk21.info});
    }
};

